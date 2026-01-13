import { ArrayMinSize, IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  showingId: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  seatIds: string[];

  @IsBoolean()
  @IsOptional()
  reserveOnly?: boolean;

  @IsBoolean()
  @IsOptional()
  useCredits?: boolean;
}
