import { ArrayMinSize, IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreatePhysicalBookingDto {
  @IsString()
  showingId: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  seatIds: string[];

  @IsEmail()
  @IsOptional()
  customerEmail?: string;
}
