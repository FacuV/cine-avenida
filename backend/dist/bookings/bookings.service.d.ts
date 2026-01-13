import { Role } from '../common/enums';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { QrService } from '../qr/qr.service';
import { SeatUpdatesGateway } from '../realtime/seat-updates.gateway';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreatePhysicalBookingDto } from './dto/create-physical-booking.dto';
export declare class BookingsService {
    private prisma;
    private emailService;
    private qrService;
    private seatUpdatesGateway;
    constructor(prisma: PrismaService, emailService: EmailService, qrService: QrService, seatUpdatesGateway: SeatUpdatesGateway);
    private applyCredits;
    createCustomerBooking(dto: CreateBookingDto, customerId: number): Promise<{
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
    createPhysicalBooking(dto: CreatePhysicalBookingDto, employeeId: number, employeeRole: Role): Promise<{
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
    listCustomerBookings(customerId: number): Promise<({
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
    private sendBookingEmail;
}
