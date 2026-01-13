import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CreditsService {
  constructor(private prisma: PrismaService) {}

  async balance(userId: number) {
    const normalizedUserId = Number(userId);
    if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
      throw new BadRequestException('Cliente invalido');
    }
    const result = await this.prisma.cinemaCredit.aggregate({
      where: { userId: normalizedUserId, remainingCents: { gt: 0 } },
      _sum: { remainingCents: true },
    });
    return { balanceCents: result._sum.remainingCents ?? 0 };
  }
}
