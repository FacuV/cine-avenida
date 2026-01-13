import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    showings(date?: string): Promise<{
        summary: {
            totalShowings: number;
            totalTicketsSold: number;
            totalReservedSeats: number;
            totalHeldSeats: number;
            totalRevenueCents: number;
        };
        showings: {
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
        }[];
    }>;
}
