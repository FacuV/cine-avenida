import { IsEmail, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsString()
  lastName: string;

  @IsInt()
  @Min(1)
  dni: number;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  type?: number;
}
