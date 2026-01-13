import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums';
import { RegisterDto } from './dto/register.dto';
import { RegisterEmployeeDto } from './dto/register-employee.dto';

const SALT_ROUNDS = 10;
const DEFAULT_USER_TYPE = 0;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registerCustomer(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new UnauthorizedException('Email ya registrado');
    }
    const existingByDni = await this.prisma.user.findUnique({
      where: { dni: dto.dni },
    });
    if (existingByDni) {
      throw new UnauthorizedException('DNI ya registrado');
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
        name: dto.name,
        lastName: dto.lastName,
        dni: dto.dni,
        type: dto.type ?? DEFAULT_USER_TYPE,
        role: Role.CUSTOMER,
      },
    });
    return this.buildAuthResponse(user);
  }

  async registerEmployee(dto: RegisterEmployeeDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new UnauthorizedException('Email ya registrado');
    }
    const existingByDni = await this.prisma.user.findUnique({
      where: { dni: dto.dni },
    });
    if (existingByDni) {
      throw new UnauthorizedException('DNI ya registrado');
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const role = dto.role === Role.ADMIN ? Role.ADMIN : Role.EMPLOYEE;
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
        name: dto.name,
        lastName: dto.lastName,
        dni: dto.dni,
        type: dto.type ?? DEFAULT_USER_TYPE,
        role,
      },
    });
    return this.buildAuthResponse(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }
    const match = await bcrypt.compare(password, user.password);
    return match ? user : null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas');
    }
    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User) {
    const role = user.role ?? Role.CUSTOMER;
    const payload = { sub: user.id, email: user.email, role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role,
      },
    };
  }
}
