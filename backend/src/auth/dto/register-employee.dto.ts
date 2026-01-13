import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Role } from '../../common/enums';

export class RegisterEmployeeDto {
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

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsInt()
  @Min(0)
  @IsOptional()
  type?: number;
}
