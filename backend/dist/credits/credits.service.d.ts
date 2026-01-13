import { PrismaService } from '../prisma/prisma.service';
export declare class CreditsService {
    private prisma;
    constructor(prisma: PrismaService);
    balance(userId: number): Promise<{
        balanceCents: number;
    }>;
}
