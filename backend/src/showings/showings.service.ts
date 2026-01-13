import { BadRequestException, Injectable, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { BookingStatus, SeatStatus, ShowingStatus } from '../common/enums';
import { PrismaService } from '../prisma/prisma.service';
import { SeatUpdatesGateway } from '../realtime/seat-updates.gateway';
import { CreateShowingDto } from './dto/create-showing.dto';
import { UpdateShowingDto } from './dto/update-showing.dto';

@Injectable()
export class ShowingsService implements OnModuleInit, OnModuleDestroy {
  private holdCleanupInterval?: NodeJS.Timeout;

  constructor(
    private prisma: PrismaService,
    private seatUpdatesGateway: SeatUpdatesGateway,
  ) {}

  onModuleInit() {
    this.holdCleanupInterval = setInterval(() => {
      void this.releaseExpiredHolds();
    }, 60_000);
  }

  onModuleDestroy() {
    if (this.holdCleanupInterval) {
      clearInterval(this.holdCleanupInterval);
    }
  }

  private async getShowing(id: string, includeCancelled = false) {
    const showing = await this.prisma.showing.findUnique({
      where: { id },
      include: { movie: true },
    });
    if (!showing) {
      throw new NotFoundException('Funcion no encontrada');
    }
    if (!includeCancelled && showing.status === ShowingStatus.CANCELLED) {
      throw new BadRequestException('Funcion cancelada');
    }
    return showing;
  }

  async create(dto: CreateShowingDto) {
    const totalSeats = dto.rows * dto.seatsPerRow;
    const startTime = new Date(dto.startTime);

    const showing = await this.prisma.$transaction(async (tx) => {
      const created = await tx.showing.create({
        data: {
          movieId: dto.movieId,
          startTime,
          priceCents: dto.priceCents,
          rows: dto.rows,
          seatsPerRow: dto.seatsPerRow,
          totalSeats,
        },
      });

      const seats = [] as { showingId: string; rowLabel: string; number: number }[];
      for (let rowIndex = 0; rowIndex < dto.rows; rowIndex += 1) {
        const rowLabel = rowIndex < 26 ? String.fromCharCode(65 + rowIndex) : `R${rowIndex + 1}`;
        for (let seatNumber = 1; seatNumber <= dto.seatsPerRow; seatNumber += 1) {
          seats.push({
            showingId: created.id,
            rowLabel,
            number: seatNumber,
          });
        }
      }

      await tx.seat.createMany({ data: seats });
      return created;
    });

    return showing;
  }

  async findAll(date?: string) {
    await this.releaseExpiredHolds();
    const where = date
      ? {
          status: ShowingStatus.SCHEDULED,
          startTime: {
            gte: new Date(`${date}T00:00:00.000Z`),
            lt: new Date(`${date}T23:59:59.999Z`),
          },
        }
      : { status: ShowingStatus.SCHEDULED };

    const showings = await this.prisma.showing.findMany({
      where,
      include: { movie: true },
      orderBy: { startTime: 'asc' },
    });

    return Promise.all(
      showings.map(async (showing) => {
        const now = new Date();
        const availableSeats = await this.prisma.seat.count({
          where: { showingId: showing.id, status: SeatStatus.AVAILABLE },
        });
        const heldSeats = await this.prisma.seatHold.count({
          where: { showingId: showing.id, expiresAt: { gt: now } },
        });
        return {
          ...showing,
          availableSeats: Math.max(availableSeats - heldSeats, 0),
        };
      }),
    );
  }

  async findOne(id: string) {
    await this.releaseExpiredHolds();
    const showing = await this.getShowing(id);
    const now = new Date();
    const availableSeats = await this.prisma.seat.count({
      where: { showingId: id, status: SeatStatus.AVAILABLE },
    });
    const heldSeats = await this.prisma.seatHold.count({
      where: { showingId: id, expiresAt: { gt: now } },
    });
    return { ...showing, availableSeats: Math.max(availableSeats - heldSeats, 0) };
  }

  async findSeats(showingId: string) {
    await this.releaseExpiredHolds();
    await this.getShowing(showingId);
    const seats = await this.prisma.seat.findMany({
      where: { showingId },
      orderBy: [{ rowLabel: 'asc' }, { number: 'asc' }],
      include: { hold: true },
    });
    const now = new Date();
    return seats.map((seat) => {
      if (seat.status === SeatStatus.AVAILABLE && seat.hold && seat.hold.expiresAt > now) {
        return { ...seat, status: SeatStatus.HELD };
      }
      return seat;
    });
  }

  async holdSeats(showingId: string, seatIds: string[], userId: number) {
    await this.getShowing(showingId);
    if (!userId) {
      throw new BadRequestException('Cliente invalido');
    }
    const uniqueSeatIds = Array.from(new Set(seatIds));
    if (uniqueSeatIds.length === 0) {
      throw new BadRequestException('Asientos invalidos');
    }

    await this.releaseExpiredHolds();
    const seats = await this.prisma.seat.findMany({
      where: { id: { in: uniqueSeatIds }, showingId },
    });
    if (seats.length !== uniqueSeatIds.length) {
      throw new BadRequestException('Algunos asientos no existen');
    }
    if (seats.some((seat) => seat.status !== SeatStatus.AVAILABLE)) {
      throw new BadRequestException('Algunos asientos no estan disponibles');
    }

    const now = new Date();
    const holds = await this.prisma.seatHold.findMany({
      where: { seatId: { in: uniqueSeatIds }, expiresAt: { gt: now } },
    });
    const conflict = holds.find((hold) => hold.userId !== userId);
    if (conflict) {
      throw new BadRequestException('Algunos asientos estan siendo reservados');
    }

    const holdMinutes = Number(process.env.SEAT_HOLD_MINUTES ?? 10);
    const normalizedHoldMinutes = Number.isFinite(holdMinutes) && holdMinutes > 0 ? holdMinutes : 10;
    const expiresAt = new Date(Date.now() + normalizedHoldMinutes * 60_000);

    await this.prisma.$transaction(
      uniqueSeatIds.map((seatId) =>
        this.prisma.seatHold.upsert({
          where: { seatId },
          update: { expiresAt, userId, showingId },
          create: { seatId, userId, showingId, expiresAt },
        }),
      ),
    );

    this.seatUpdatesGateway.notifySeats(
      showingId,
      uniqueSeatIds.map((id) => ({ id, status: SeatStatus.HELD })),
    );

    return { heldSeatIds: uniqueSeatIds, expiresAt };
  }

  async releaseSeats(showingId: string, seatIds: string[], userId: number) {
    if (!userId) {
      throw new BadRequestException('Cliente invalido');
    }
    const uniqueSeatIds = Array.from(new Set(seatIds));
    if (uniqueSeatIds.length === 0) {
      throw new BadRequestException('Asientos invalidos');
    }

    await this.prisma.seatHold.deleteMany({
      where: { seatId: { in: uniqueSeatIds }, userId },
    });

    this.seatUpdatesGateway.notifySeats(
      showingId,
      uniqueSeatIds.map((id) => ({ id, status: SeatStatus.AVAILABLE })),
    );

    return { releasedSeatIds: uniqueSeatIds };
  }

  private async releaseExpiredHolds() {
    try {
      const now = new Date();
      const expired = await this.prisma.seatHold.findMany({
        where: { expiresAt: { lte: now } },
        select: { seatId: true, showingId: true },
      });
      if (expired.length === 0) {
        return;
      }

      await this.prisma.seatHold.deleteMany({ where: { expiresAt: { lte: now } } });

      const updatesByShowing = expired.reduce<Record<string, string[]>>((acc, hold) => {
        acc[hold.showingId] = acc[hold.showingId] ?? [];
        acc[hold.showingId].push(hold.seatId);
        return acc;
      }, {});

      Object.entries(updatesByShowing).forEach(([showingId, seatIds]) => {
        this.seatUpdatesGateway.notifySeats(
          showingId,
          seatIds.map((id) => ({ id, status: SeatStatus.AVAILABLE })),
        );
      });
    } catch (error) {
      console.error('Error al liberar reservas expiradas:', error);
    }
  }

  async update(id: string, dto: UpdateShowingDto) {
    const showing = await this.getShowing(id, true);
    if (showing.status === ShowingStatus.CANCELLED) {
      throw new BadRequestException('No se puede editar una funcion cancelada');
    }
    return this.prisma.showing.update({
      where: { id },
      data: {
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        priceCents: dto.priceCents,
      },
    });
  }

  async remove(id: string) {
    await this.getShowing(id, true);
    const ticketCount = await this.prisma.ticket.count({
      where: { seat: { showingId: id } },
    });
    if (ticketCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar la funcion: hay entradas vendidas. Cancela la funcion.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.seatHold.deleteMany({ where: { showingId: id } });
      await tx.seat.deleteMany({ where: { showingId: id } });
      return tx.showing.delete({ where: { id } });
    });
  }

  async cancel(id: string) {
    const showing = await this.getShowing(id, true);
    if (showing.status === ShowingStatus.CANCELLED) {
      return {
        status: ShowingStatus.CANCELLED,
        cancelledAt: showing.cancelledAt,
        creditsIssued: 0,
      };
    }

    const bookings = await this.prisma.booking.findMany({
      where: { tickets: { some: { seat: { showingId: id } } } },
    });

    const creditsData: Array<{
      userId: number;
      bookingId: string;
      showingId: string;
      amountCents: number;
      remainingCents: number;
      reason: string;
    }> = [];
    for (const booking of bookings) {
      if (booking.status !== BookingStatus.PAID) {
        continue;
      }
      let creditUserId = booking.customerId ?? null;
      if (!creditUserId && booking.customerEmail) {
        const user = await this.prisma.user.findUnique({
          where: { email: booking.customerEmail },
          select: { id: true },
        });
        creditUserId = user?.id ?? null;
      }
      if (!creditUserId) {
        continue;
      }
      creditsData.push({
        userId: creditUserId,
        bookingId: booking.id,
        showingId: id,
        amountCents: booking.totalPriceCents,
        remainingCents: booking.totalPriceCents,
        reason: 'SHOWING_CANCELLED',
      });
    }

    const cancelledAt = new Date();
    await this.prisma.$transaction(async (tx) => {
      if (bookings.length > 0) {
        await tx.booking.updateMany({
          where: { id: { in: bookings.map((booking) => booking.id) } },
          data: { status: BookingStatus.CANCELLED },
        });
      }
      if (creditsData.length > 0) {
        await tx.cinemaCredit.createMany({ data: creditsData });
      }
      await tx.seatHold.deleteMany({ where: { showingId: id } });
      await tx.showing.update({
        where: { id },
        data: {
          status: ShowingStatus.CANCELLED,
          cancelledAt,
        },
      });
    });

    return {
      status: ShowingStatus.CANCELLED,
      creditsIssued: creditsData.length,
      cancelledAt,
    };
  }
}
