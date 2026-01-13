import { type Response } from 'express';
import { ScanTicketDto } from './dto/scan-ticket.dto';
import { TicketsService } from './tickets.service';
export declare class TicketsController {
    private ticketsService;
    constructor(ticketsService: TicketsService);
    scan(dto: ScanTicketDto): Promise<{
        ticket: {
            seat: {
                showing: {
                    movie: {
                        id: string;
                        createdAt: Date;
                        title: string;
                        description: string;
                        durationMinutes: number;
                        language: string;
                        format: import(".prisma/client").$Enums.Format;
                        posterUrl: string | null;
                        updatedAt: Date;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    movieId: string;
                    startTime: Date;
                    priceCents: number;
                    rows: number;
                    seatsPerRow: number;
                    totalSeats: number;
                    status: import(".prisma/client").$Enums.ShowingStatus;
                    cancelledAt: Date | null;
                };
            } & {
                number: number;
                id: string;
                showingId: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.SeatStatus;
                rowLabel: string;
            };
            booking: {
                id: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.BookingStatus;
                channel: import(".prisma/client").$Enums.PurchaseChannel;
                totalPriceCents: number;
                customerId: number | null;
                soldById: number | null;
                customerEmail: string | null;
            };
        } & {
            id: string;
            bookingId: string;
            createdAt: Date;
            seatId: string;
            qrToken: string;
            checkedInAt: Date | null;
        };
        alreadyCheckedIn: boolean;
    }>;
    qr(qrToken: string, res: Response): Promise<void>;
    find(qrToken: string): Promise<{
        seat: {
            showing: {
                movie: {
                    id: string;
                    createdAt: Date;
                    title: string;
                    description: string;
                    durationMinutes: number;
                    language: string;
                    format: import(".prisma/client").$Enums.Format;
                    posterUrl: string | null;
                    updatedAt: Date;
                };
            } & {
                id: string;
                createdAt: Date;
                movieId: string;
                startTime: Date;
                priceCents: number;
                rows: number;
                seatsPerRow: number;
                totalSeats: number;
                status: import(".prisma/client").$Enums.ShowingStatus;
                cancelledAt: Date | null;
            };
        } & {
            number: number;
            id: string;
            showingId: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.SeatStatus;
            rowLabel: string;
        };
        booking: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.BookingStatus;
            channel: import(".prisma/client").$Enums.PurchaseChannel;
            totalPriceCents: number;
            customerId: number | null;
            soldById: number | null;
            customerEmail: string | null;
        };
    } & {
        id: string;
        bookingId: string;
        createdAt: Date;
        seatId: string;
        qrToken: string;
        checkedInAt: Date | null;
    }>;
}
