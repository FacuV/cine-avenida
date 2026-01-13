import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ShowingStatus } from '../common/enums';
import { PrismaService } from '../prisma/prisma.service';
import { QrService } from '../qr/qr.service';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private qrService: QrService,
  ) {}

  async findByToken(qrToken: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { qrToken },
      include: {
        seat: {
          include: {
            showing: { include: { movie: true } },
          },
        },
        booking: true,
      },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }
    return ticket;
  }

  async scanTicket(qrToken: string) {
    const ticket = await this.findByToken(qrToken);
    if (ticket.seat.showing.status === ShowingStatus.CANCELLED) {
      throw new BadRequestException('Funcion cancelada');
    }
    if (ticket.checkedInAt) {
      return { ticket, alreadyCheckedIn: true };
    }

    const updated = await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { checkedInAt: new Date() },
      include: {
        seat: { include: { showing: { include: { movie: true } } } },
        booking: true,
      },
    });

    if (!updated) {
      throw new BadRequestException('No se pudo validar el ticket');
    }

    return { ticket: updated, alreadyCheckedIn: false };
  }

  async generateQrPng(qrToken: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { qrToken },
      select: { id: true },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }
    return this.qrService.toPngBuffer(qrToken);
  }
}
