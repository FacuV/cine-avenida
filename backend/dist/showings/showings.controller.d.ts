import { CreateShowingDto } from './dto/create-showing.dto';
import { SeatHoldDto } from './dto/seat-hold.dto';
import { UpdateShowingDto } from './dto/update-showing.dto';
import { ShowingsService } from './showings.service';
export declare class ShowingsController {
    private showingsService;
    constructor(showingsService: ShowingsService);
    findAll(date?: string): Promise<{
        availableSeats: number;
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
        id: string;
        startTime: Date;
        priceCents: number;
        rows: number;
        seatsPerRow: number;
        totalSeats: number;
        status: import(".prisma/client").$Enums.ShowingStatus;
        cancelledAt: Date | null;
        createdAt: Date;
        movieId: string;
    }[]>;
    findOne(id: string): Promise<{
        availableSeats: number;
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
        id: string;
        startTime: Date;
        priceCents: number;
        rows: number;
        seatsPerRow: number;
        totalSeats: number;
        status: import(".prisma/client").$Enums.ShowingStatus;
        cancelledAt: Date | null;
        createdAt: Date;
        movieId: string;
    }>;
    findSeats(id: string): Promise<({
        hold: {
            id: string;
            createdAt: Date;
            showingId: string;
            seatId: string;
            userId: number;
            expiresAt: Date;
        } | null;
    } & {
        number: number;
        id: string;
        status: import(".prisma/client").$Enums.SeatStatus;
        createdAt: Date;
        showingId: string;
        rowLabel: string;
    })[]>;
    create(dto: CreateShowingDto): Promise<{
        id: string;
        startTime: Date;
        priceCents: number;
        rows: number;
        seatsPerRow: number;
        totalSeats: number;
        status: import(".prisma/client").$Enums.ShowingStatus;
        cancelledAt: Date | null;
        createdAt: Date;
        movieId: string;
    }>;
    holdSeats(id: string, dto: SeatHoldDto, req: {
        user?: {
            sub: number;
        };
    }): Promise<{
        heldSeatIds: string[];
        expiresAt: Date;
    }>;
    releaseSeats(id: string, dto: SeatHoldDto, req: {
        user?: {
            sub: number;
        };
    }): Promise<{
        releasedSeatIds: string[];
    }>;
    update(id: string, dto: UpdateShowingDto): Promise<{
        id: string;
        startTime: Date;
        priceCents: number;
        rows: number;
        seatsPerRow: number;
        totalSeats: number;
        status: import(".prisma/client").$Enums.ShowingStatus;
        cancelledAt: Date | null;
        createdAt: Date;
        movieId: string;
    }>;
    cancel(id: string): Promise<{
        status: import("../common/enums").ShowingStatus;
        cancelledAt: Date | null;
        creditsIssued: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        startTime: Date;
        priceCents: number;
        rows: number;
        seatsPerRow: number;
        totalSeats: number;
        status: import(".prisma/client").$Enums.ShowingStatus;
        cancelledAt: Date | null;
        createdAt: Date;
        movieId: string;
    }>;
}
