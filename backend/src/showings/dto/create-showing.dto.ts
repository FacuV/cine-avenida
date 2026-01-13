import { IsDateString, IsInt, IsString, Min } from 'class-validator';

export class CreateShowingDto {
  @IsString()
  movieId: string;

  @IsDateString()
  startTime: string;

  @IsInt()
  @Min(0)
  priceCents: number;

  @IsInt()
  @Min(1)
  rows: number;

  @IsInt()
  @Min(1)
  seatsPerRow: number;
}
