import { Injectable } from '@nestjs/common';
import { SeatStatus, ShowingStatus } from '../common/enums';
import { PrismaService } from '../prisma/prisma.service';

type ReportShowing = {
  id: string;
  startTime: Date;
  priceCents: number;
  totalSeats: number;
  availableSeats: number;
  soldSeats: number;
  reservedSeats: number;
  heldSeats: number;
  revenueCents: number;
  movie: {
    title: string;
    format: string;
    language: string;
  };
};

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async showingsReport(date?: string) {
    const where = date
      ? {
          status: ShowingStatus.SCHEDULED,
          startTime: {
            gte: new Date(`${date}T00:00:00.000Z`),
            lt: new Date(`${date}T23:59:59.999Z`),
          },
        }
      : { status: ShowingStatus.SCHEDULED };

    const now = new Date();
    await this.prisma.seatHold.deleteMany({ where: { expiresAt: { lte: now } } });

    const showings = await this.prisma.showing.findMany({
      where,
      include: { movie: true },
      orderBy: { startTime: 'asc' },
    });

    if (showings.length === 0) {
      return {
        summary: {
          totalShowings: 0,
          totalTicketsSold: 0,
          totalReservedSeats: 0,
          totalHeldSeats: 0,
          totalRevenueCents: 0,
        },
        showings: [] as ReportShowing[],
      };
    }

    const showingIds = showings.map((showing) => showing.id);

    const seatCounts = await this.prisma.seat.groupBy({
      by: ['showingId', 'status'],
      where: { showingId: { in: showingIds } },
      _count: { _all: true },
    });

    const holdCounts = await this.prisma.seatHold.groupBy({
      by: ['showingId'],
      where: { showingId: { in: showingIds }, expiresAt: { gt: now } },
      _count: { _all: true },
    });

    const statusMap = seatCounts.reduce<Record<string, Record<string, number>>>((acc, row) => {
      if (!acc[row.showingId]) {
        acc[row.showingId] = {};
      }
      acc[row.showingId][row.status] = row._count._all;
      return acc;
    }, {});

    const holdMap = holdCounts.reduce<Record<string, number>>((acc, row) => {
      acc[row.showingId] = row._count._all;
      return acc;
    }, {});

    const reportShowings = showings.map((showing) => {
      const statusCounts = statusMap[showing.id] ?? {};
      const soldSeats =
        (statusCounts[SeatStatus.SOLD_ONLINE] ?? 0) +
        (statusCounts[SeatStatus.SOLD_PHYSICAL] ?? 0);
      const reservedSeats = statusCounts[SeatStatus.HELD] ?? 0;
      const heldSeats = holdMap[showing.id] ?? 0;
      const availableSeats = Math.max(
        showing.totalSeats - soldSeats - reservedSeats - heldSeats,
        0,
      );
      const revenueCents = soldSeats * showing.priceCents;
      return {
        id: showing.id,
        startTime: showing.startTime,
        priceCents: showing.priceCents,
        totalSeats: showing.totalSeats,
        availableSeats,
        soldSeats,
        reservedSeats,
        heldSeats,
        revenueCents,
        movie: {
          title: showing.movie.title,
          format: showing.movie.format,
          language: showing.movie.language,
        },
      };
    });

    const summary = reportShowings.reduce(
      (acc, showing) => {
        acc.totalShowings += 1;
        acc.totalTicketsSold += showing.soldSeats;
        acc.totalReservedSeats += showing.reservedSeats;
        acc.totalHeldSeats += showing.heldSeats;
        acc.totalRevenueCents += showing.revenueCents;
        return acc;
      },
      {
        totalShowings: 0,
        totalTicketsSold: 0,
        totalReservedSeats: 0,
        totalHeldSeats: 0,
        totalRevenueCents: 0,
      },
    );

    return {
      summary,
      showings: reportShowings,
    };
  }
}
