import { Injectable } from '@nestjs/common';
import { Coach } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma.service';

@Injectable()
export class CoachService {
  constructor(private readonly prismaService: PrismaService) {}
  async createCoach(
    name: string,
    tx: Prisma.TransactionClient,
  ): Promise<Coach> {
    const coach: Coach = await tx.coach.create({
      data: {
        name,
      },
    });
    return coach;
  }
  async findCoachById(id: string): Promise<Coach | null> {
    const coach: Coach | null = await this.prismaService.coach.findUnique({
      where: { id },
    });
    return coach;
  }
}
