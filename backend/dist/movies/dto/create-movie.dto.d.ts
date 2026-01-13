import { Format } from '../../common/enums';
export declare class CreateMovieDto {
    title: string;
    description: string;
    durationMinutes: number;
    language: string;
    format: Format;
    posterUrl?: string;
}
