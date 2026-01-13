import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Format } from '../../common/enums';

export class UpdateMovieDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  durationMinutes?: number;

  @IsString()
  @IsOptional()
  language?: string;

  @IsEnum(Format)
  @IsOptional()
  format?: Format;

  @IsString()
  @IsOptional()
  posterUrl?: string;
}
