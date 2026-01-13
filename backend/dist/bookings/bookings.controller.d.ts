import { Role } from '../common/enums';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreatePhysicalBookingDto } from './dto/create-physical-booking.dto';
import { BookingsService } from './bookings.service';
export declare class BookingsController {
    private bookingsService;
    constructor(bookingsService: BookingsService);
    createBooking(dto: CreateBookingDto, req: {
        user?: {
            sub: number;
        };
    }): Promise<{
        tickets: ({
            seat: {
                number: number;
                id: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.SeatStatus;
                showingId: string;
                rowLabel: string;
            };
        } & {
            id: string;
            createdAt: Date;
            bookingId: string;
            seatId: string;
            qrToken: string;
            checkedInAt: Date | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.BookingStatus;
        channel: import(".prisma/client").$Enums.PurchaseChannel;
        totalPriceCents: number;
        customerId: number | null;
        soldById: number | null;
        customerEmail: string | null;
    }>;
    createPhysical(dto: CreatePhysicalBookingDto, req: {
        user?: {
            sub: number;
            role: Role;
        };
    }): Promise<{
        tickets: ({
            seat: {
                number: number;
                id: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.SeatStatus;
                showingId: string;
                rowLabel: string;
            };
        } & {
            id: string;
            createdAt: Date;
            bookingId: string;
            seatId: string;
            qrToken: string;
            checkedInAt: Date | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.BookingStatus;
        channel: import(".prisma/client").$Enums.PurchaseChannel;
        totalPriceCents: number;
        customerId: number | null;
        soldById: number | null;
        customerEmail: string | null;
    }>;
    listMine(req: {
        user?: {
            sub: number;
        };
    }): Promise<({
        tickets: ({
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
                    status: import(".prisma/client").$Enums.ShowingStatus;
                    movieId: string;
                    startTime: Date;
                    priceCents: number;
                    rows: number;
                    seatsPerRow: number;
                    totalSeats: number;
                    cancelledAt: Date | null;
                };
            } & {
                number: number;
                id: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.SeatStatus;
                showingId: string;
                rowLabel: string;
            };
        } & {
            id: string;
            createdAt: Date;
            bookingId: string;
            seatId: string;
            qrToken: string;
            checkedInAt: Date | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.BookingStatus;
        channel: import(".prisma/client").$Enums.PurchaseChannel;
        totalPriceCents: number;
        customerId: number | null;
        soldById: number | null;
        customerEmail: string | null;
    })[]>;
}
