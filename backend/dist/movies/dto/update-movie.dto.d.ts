import { Format } from '../../common/enums';
export declare class UpdateMovieDto {
    title?: string;
    description?: string;
    durationMinutes?: number;
    language?: string;
    format?: Format;
    posterUrl?: string;
}
