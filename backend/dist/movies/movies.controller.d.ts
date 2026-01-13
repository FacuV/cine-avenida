import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MoviesService } from './movies.service';
export declare class MoviesController {
    private moviesService;
    constructor(moviesService: MoviesService);
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
