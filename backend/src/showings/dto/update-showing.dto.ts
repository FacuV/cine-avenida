import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateShowingDto {
  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  priceCents?: number;
}
