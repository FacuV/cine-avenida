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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const enums_1 = require("../common/enums");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async showingsReport(date) {
        const where = date
            ? {
                status: enums_1.ShowingStatus.SCHEDULED,
                startTime: {
                    gte: new Date(`${date}T00:00:00.000Z`),
                    lt: new Date(`${date}T23:59:59.999Z`),
                },
            }
            : { status: enums_1.ShowingStatus.SCHEDULED };
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
                showings: [],
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
        const statusMap = seatCounts.reduce((acc, row) => {
            if (!acc[row.showingId]) {
                acc[row.showingId] = {};
            }
            acc[row.showingId][row.status] = row._count._all;
            return acc;
        }, {});
        const holdMap = holdCounts.reduce((acc, row) => {
            acc[row.showingId] = row._count._all;
            return acc;
        }, {});
        const reportShowings = showings.map((showing) => {
            const statusCounts = statusMap[showing.id] ?? {};
            const soldSeats = (statusCounts[enums_1.SeatStatus.SOLD_ONLINE] ?? 0) +
                (statusCounts[enums_1.SeatStatus.SOLD_PHYSICAL] ?? 0);
            const reservedSeats = statusCounts[enums_1.SeatStatus.HELD] ?? 0;
            const heldSeats = holdMap[showing.id] ?? 0;
            const availableSeats = Math.max(showing.totalSeats - soldSeats - reservedSeats - heldSeats, 0);
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
        const summary = reportShowings.reduce((acc, showing) => {
            acc.totalShowings += 1;
            acc.totalTicketsSold += showing.soldSeats;
            acc.totalReservedSeats += showing.reservedSeats;
            acc.totalHeldSeats += showing.heldSeats;
            acc.totalRevenueCents += showing.revenueCents;
            return acc;
        }, {
            totalShowings: 0,
            totalTicketsSold: 0,
            totalReservedSeats: 0,
            totalHeldSeats: 0,
            totalRevenueCents: 0,
        });
        return {
            summary,
            showings: reportShowings,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map