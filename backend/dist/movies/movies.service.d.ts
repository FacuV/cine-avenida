import { PrismaService } from '../prisma/prisma.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
export declare class MoviesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateMovieDto): import(".prisma/client").Prisma.Prisma__MovieClient<{
        id: string;
        createdAt: Date;
        title: string;
        description: string;
        durationMinutes: number;
        language: string;
        format: import(".prisma/client").$Enums.Format;
        posterUrl: string | null;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string;
        durationMinutes: number;
        language: string;
        format: import(".prisma/client").$Enums.Format;
        posterUrl: string | null;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string;
        durationMinutes: number;
        language: string;
        format: import(".prisma/client").$Enums.Format;
        posterUrl: string | null;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateMovieDto): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string;
        durationMinutes: number;
        language: string;
        format: import(".prisma/client").$Enums.Format;
        posterUrl: string | null;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string;
        durationMinutes: number;
        language: string;
        format: import(".prisma/client").$Enums.Format;
        posterUrl: string | null;
        updatedAt: Date;
    }>;
}
