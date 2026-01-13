"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const enums_1 = require("../common/enums");
const email_service_1 = require("../email/email.service");
const prisma_service_1 = require("../prisma/prisma.service");
const qr_service_1 = require("../qr/qr.service");
const seat_updates_gateway_1 = require("../realtime/seat-updates.gateway");
const moneyFormatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
});
let BookingsService = class BookingsService {
    prisma;
    emailService;
    qrService;
    seatUpdatesGateway;
    constructor(prisma, emailService, qrService, seatUpdatesGateway) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.qrService = qrService;
        this.seatUpdatesGateway = seatUpdatesGateway;
    }
    async applyCredits(tx, userId, totalCents) {
        if (totalCents <= 0) {
            return 0;
        }
        const credits = await tx.cinemaCredit.findMany({
            where: { userId, remainingCents: { gt: 0 } },
            orderBy: { createdAt: 'asc' },
        });
        let remaining = totalCents;
        for (const credit of credits) {
            if (remaining <= 0) {
                break;
            }
            const amountToUse = Math.min(credit.remainingCents, remaining);
            remaining -= amountToUse;
            await tx.cinemaCredit.update({
                where: { id: credit.id },
                data: { remainingCents: credit.remainingCents - amountToUse },
            });
        }
        return totalCents - remaining;
    }
    async createCustomerBooking(dto, customerId) {
        const normalizedCustomerId = Number(customerId);
        if (!Number.isInteger(normalizedCustomerId) || normalizedCustomerId <= 0) {
            throw new common_1.BadRequestException('Cliente invalido');
        }
        const customer = await this.prisma.user.findUnique({
            where: { id: normalizedCustomerId },
        });
        if (!customer) {
            throw new common_1.BadRequestException('Cliente invalido');
        }
        const showing = await this.prisma.showing.findUnique({
            where: { id: dto.showingId },
            include: { movie: true },
        });
        if (!showing) {
            throw new common_1.NotFoundException('Funcion no encontrada');
        }
        if (showing.status === enums_1.ShowingStatus.CANCELLED) {
            throw new common_1.BadRequestException('Funcion cancelada');
        }
        const seats = await this.prisma.seat.findMany({
            where: { id: { in: dto.seatIds }, showingId: dto.showingId },
        });
        if (seats.length !== dto.seatIds.length) {
            throw new common_1.BadRequestException('Algunos asientos no existen');
        }
        if (seats.some((seat) => seat.status !== enums_1.SeatStatus.AVAILABLE)) {
            throw new common_1.BadRequestException('Algunos asientos no estan disponibles');
        }
        const now = new Date();
        const holds = await this.prisma.seatHold.findMany({
            where: { seatId: { in: dto.seatIds }, expiresAt: { gt: now } },
        });
        const conflictHold = holds.find((hold) => hold.userId !== normalizedCustomerId);
        if (conflictHold) {
            throw new common_1.BadRequestException('Algunos asientos estan siendo reservados');
        }
        const reserveOnly = dto.reserveOnly === true;
        if (reserveOnly && dto.useCredits === true) {
            throw new common_1.BadRequestException('No se puede usar credito en una reserva sin pago');
        }
        const status = reserveOnly ? enums_1.BookingStatus.RESERVED : enums_1.BookingStatus.PAID;
        const seatStatus = reserveOnly ? enums_1.SeatStatus.HELD : enums_1.SeatStatus.SOLD_ONLINE;
        const booking = await this.prisma.$transaction(async (tx) => {
            const totalPriceCents = showing.priceCents * seats.length;
            const useCredits = dto.useCredits === true && !reserveOnly;
            const booking = await tx.booking.create({
                data: {
                    customerId: normalizedCustomerId,
                    customerEmail: customer.email,
                    status,
                    channel: enums_1.PurchaseChannel.ONLINE,
                    totalPriceCents,
                },
            });
            const updated = await tx.seat.updateMany({
                where: { id: { in: dto.seatIds }, status: enums_1.SeatStatus.AVAILABLE },
                data: { status: seatStatus },
            });
            if (updated.count !== dto.seatIds.length) {
                throw new common_1.BadRequestException('No fue posible reservar los asientos');
            }
            if (!reserveOnly) {
                await tx.ticket.createMany({
                    data: seats.map((seat) => ({
                        bookingId: booking.id,
                        seatId: seat.id,
                        qrToken: (0, crypto_1.randomUUID)(),
                    })),
                });
            }
            if (useCredits) {
                await this.applyCredits(tx, normalizedCustomerId, totalPriceCents);
            }
            await tx.seatHold.deleteMany({
                where: { seatId: { in: dto.seatIds } },
            });
            return tx.booking.findUnique({
                where: { id: booking.id },
                include: { tickets: { include: { seat: true } } },
            });
        });
        if (!booking) {
            throw new common_1.BadRequestException('No fue posible registrar la reserva');
        }
        await this.sendBookingEmail({
            email: customer.email,
            booking,
            showing,
            seats,
            reserveOnly,
        });
        this.seatUpdatesGateway.notifySeats(dto.showingId, dto.seatIds.map((id) => ({ id, status: seatStatus })));
        return booking;
    }
    async createPhysicalBooking(dto, employeeId, employeeRole) {
        const normalizedEmployeeId = Number(employeeId);
        if (!Number.isInteger(normalizedEmployeeId) || normalizedEmployeeId <= 0) {
            throw new common_1.BadRequestException('Empleado invalido');
        }
        if (![enums_1.Role.EMPLOYEE, enums_1.Role.ADMIN].includes(employeeRole)) {
            throw new common_1.BadRequestException('Sin permisos para venta fisica');
        }
        const showing = await this.prisma.showing.findUnique({
            where: { id: dto.showingId },
            include: { movie: true },
        });
        if (!showing) {
            throw new common_1.NotFoundException('Funcion no encontrada');
        }
        const seats = await this.prisma.seat.findMany({
            where: { id: { in: dto.seatIds }, showingId: dto.showingId },
        });
        if (seats.length !== dto.seatIds.length) {
            throw new common_1.BadRequestException('Algunos asientos no existen');
        }
        if (seats.some((seat) => seat.status !== enums_1.SeatStatus.AVAILABLE)) {
            throw new common_1.BadRequestException('Algunos asientos no estan disponibles');
        }
        const now = new Date();
        const holds = await this.prisma.seatHold.findMany({
            where: { seatId: { in: dto.seatIds }, expiresAt: { gt: now } },
        });
        if (holds.length > 0) {
            throw new common_1.BadRequestException('Algunos asientos estan siendo reservados');
        }
        const booking = await this.prisma.$transaction(async (tx) => {
            const booking = await tx.booking.create({
                data: {
                    soldById: normalizedEmployeeId,
                    status: enums_1.BookingStatus.PAID,
                    channel: enums_1.PurchaseChannel.PHYSICAL,
                    totalPriceCents: showing.priceCents * seats.length,
                    customerEmail: dto.customerEmail,
                },
            });
            const updated = await tx.seat.updateMany({
                where: { id: { in: dto.seatIds }, status: enums_1.SeatStatus.AVAILABLE },
                data: { status: enums_1.SeatStatus.SOLD_PHYSICAL },
            });
            if (updated.count !== dto.seatIds.length) {
                throw new common_1.BadRequestException('No fue posible registrar la venta');
            }
            await tx.ticket.createMany({
                data: seats.map((seat) => ({
                    bookingId: booking.id,
                    seatId: seat.id,
                    qrToken: (0, crypto_1.randomUUID)(),
                })),
            });
            await tx.seatHold.deleteMany({
                where: { seatId: { in: dto.seatIds } },
            });
            return tx.booking.findUnique({
                where: { id: booking.id },
                include: { tickets: { include: { seat: true } } },
            });
        });
        if (!booking) {
            throw new common_1.BadRequestException('No fue posible registrar la venta');
        }
        await this.sendBookingEmail({
            email: dto.customerEmail,
            booking,
            showing,
            seats,
            reserveOnly: false,
        });
        this.seatUpdatesGateway.notifySeats(dto.showingId, dto.seatIds.map((id) => ({ id, status: enums_1.SeatStatus.SOLD_PHYSICAL })));
        return booking;
    }
    async listCustomerBookings(customerId) {
        const normalizedCustomerId = Number(customerId);
        if (!Number.isInteger(normalizedCustomerId) || normalizedCustomerId <= 0) {
            throw new common_1.BadRequestException('Cliente invalido');
        }
        return this.prisma.booking.findMany({
            where: { customerId: normalizedCustomerId },
            include: {
                tickets: {
                    include: { seat: { include: { showing: { include: { movie: true } } } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async sendBookingEmail({ email, booking, showing, seats, reserveOnly, }) {
        if (!email) {
            return;
        }
        try {
            const formattedDate = new Date(showing.startTime).toLocaleString('es-AR', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
            });
            const sortedSeats = [...seats].sort((a, b) => a.rowLabel.localeCompare(b.rowLabel) || a.number - b.number);
            const seatList = sortedSeats.map((seat) => `${seat.rowLabel}-${seat.number}`).join(', ');
            const totalLabel = moneyFormatter.format(booking.totalPriceCents / 100);
            const tickets = booking.tickets ?? [];
            const hasTickets = tickets.length > 0;
            const subject = hasTickets
                ? 'Tus entradas - Cine Avenida'
                : 'Reserva registrada - Cine Avenida';
            const attachments = [];
            const ticketsHtml = [];
            if (hasTickets) {
                for (const [index, ticket] of tickets.entries()) {
                    const seatLabel = ticket.seat
                        ? `${ticket.seat.rowLabel}-${ticket.seat.number}`
                        : `Asiento ${index + 1}`;
                    const cid = `qr-${ticket.qrToken}@cine-avenida`;
                    const qrBuffer = await this.qrService.toPngBuffer(ticket.qrToken);
                    attachments.push({
                        filename: `qr-${seatLabel.replace(/\s+/g, '-')}.png`,
                        content: qrBuffer,
                        cid,
                    });
                    ticketsHtml.push(`
            <div style="border:1px solid #efe6dc;padding:12px;border-radius:12px;margin-bottom:12px;">
              <p style="margin:0 0 8px;font-weight:600;">Asiento ${seatLabel}</p>
              <img src="cid:${cid}" alt="QR ${seatLabel}" width="200" height="200" />
              <p style="margin:8px 0 0;color:#5f5a54;">Token: ${ticket.qrToken}</p>
            </div>
          `);
                }
            }
            const ticketsText = hasTickets
                ? tickets
                    .map((ticket, index) => {
                    const seatLabel = ticket.seat
                        ? `${ticket.seat.rowLabel}-${ticket.seat.number}`
                        : `Asiento ${index + 1}`;
                    return `Asiento ${seatLabel} - QR: ${ticket.qrToken}`;
                })
                    .join('\n')
                : 'Reserva sin pago. Confirma en boleteria antes de la funcion.';
            const html = `
        <div style="font-family:Arial,sans-serif;background:#faf6ef;padding:24px;">
          <h2 style="margin:0 0 6px;">Cine Avenida</h2>
          <p style="margin:0 0 16px;color:#5f5a54;">${hasTickets ? 'Tus entradas estan listas.' : 'Reserva registrada.'}</p>
          <div style="background:#fff;border:1px solid #efe6dc;border-radius:16px;padding:16px;margin-bottom:16px;">
            <p style="margin:0 0 6px;"><strong>Pelicula:</strong> ${showing.movie.title}</p>
            <p style="margin:0 0 6px;"><strong>Funcion:</strong> ${formattedDate}</p>
            <p style="margin:0 0 6px;"><strong>Formato:</strong> ${showing.movie.format}</p>
            <p style="margin:0 0 6px;"><strong>Idioma:</strong> ${showing.movie.language}</p>
            <p style="margin:0 0 6px;"><strong>Asientos:</strong> ${seatList}</p>
            <p style="margin:0;"><strong>Total:</strong> ${totalLabel}</p>
          </div>
          ${hasTickets
                ? `<h3 style="margin:0 0 12px;">QR de entrada</h3>${ticketsHtml.join('')}`
                : `<p style="margin:0;">${ticketsText}</p>`}
          ${reserveOnly
                ? '<p style="margin:16px 0 0;color:#5f5a54;">Reserva sin pago: confirma en boleteria antes de la funcion.</p>'
                : ''}
        </div>
      `;
            const text = `Cine Avenida
Pelicula: ${showing.movie.title}
Funcion: ${formattedDate}
Formato: ${showing.movie.format}
Idioma: ${showing.movie.language}
Asientos: ${seatList}
Total: ${totalLabel}

${ticketsText}`;
            await this.emailService.sendEmail(email, subject, text, html, attachments.length ? attachments : undefined);
        }
        catch (error) {
            console.error('Error al enviar email de reserva:', error);
        }
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        qr_service_1.QrService,
        seat_updates_gateway_1.SeatUpdatesGateway])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map