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
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    showingsReport(date?: string): Promise<{
        summary: {
            totalShowings: number;
            totalTicketsSold: number;
            totalReservedSeats: number;
            totalHeldSeats: number;
            totalRevenueCents: number;
        };
        showings: ReportShowing[];
    }>;
}
export {};
