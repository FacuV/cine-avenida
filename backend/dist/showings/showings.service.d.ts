import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ShowingStatus } from '../common/enums';
import { PrismaService } from '../prisma/prisma.service';
import { SeatUpdatesGateway } from '../realtime/seat-updates.gateway';
import { CreateShowingDto } from './dto/create-showing.dto';
import { UpdateShowingDto } from './dto/update-showing.dto';
export declare class ShowingsService implements OnModuleInit, OnModuleDestroy {
    private prisma;
    private seatUpdatesGateway;
    private holdCleanupInterval?;
    constructor(prisma: PrismaService, seatUpdatesGateway: SeatUpdatesGateway);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private getShowing;
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
    findSeats(showingId: string): Promise<({
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
    holdSeats(showingId: string, seatIds: string[], userId: number): Promise<{
        heldSeatIds: string[];
        expiresAt: Date;
    }>;
    releaseSeats(showingId: string, seatIds: string[], userId: number): Promise<{
        releasedSeatIds: string[];
    }>;
    private releaseExpiredHolds;
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
    cancel(id: string): Promise<{
        status: ShowingStatus;
        cancelledAt: Date | null;
        creditsIssued: number;
    }>;
}
