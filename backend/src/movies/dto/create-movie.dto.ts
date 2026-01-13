import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Format } from '../../common/enums';

export class CreateMovieDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsString()
  language: string;

  @IsEnum(Format)
  format: Format;

  @IsString()
  @IsOptional()
  posterUrl?: string;
}
