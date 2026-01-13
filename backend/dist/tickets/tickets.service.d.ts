import { PrismaService } from '../prisma/prisma.service';
import { QrService } from '../qr/qr.service';
export declare class TicketsService {
    private prisma;
    private qrService;
    constructor(prisma: PrismaService, qrService: QrService);
    findByToken(qrToken: string): Promise<{
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
    scanTicket(qrToken: string): Promise<{
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
    generateQrPng(qrToken: string): Promise<any>;
}
