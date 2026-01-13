import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterEmployeeDto } from './dto/register-employee.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    registerCustomer(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    registerEmployee(dto: RegisterEmployeeDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    validateUser(email: string, password: string): Promise<{
        id: number;
        email: string;
        dni: number;
        name: string;
        lastName: string;
        password: string;
        type: number;
        role: import(".prisma/client").$Enums.Role;
        availableHours: number | null;
        availableMinutes: number | null;
        usedHours: number | null;
        recoveryCode: number | null;
    } | null>;
    login(email: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: number;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    private buildAuthResponse;
}
