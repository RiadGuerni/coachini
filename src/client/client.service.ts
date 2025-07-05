import { Injectable } from '@nestjs/common';
import { Client, Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma.service';

@Injectable()
export class ClientService {
  constructor(private readonly prismaService: PrismaService) {}
  async createClient(
    name: string,
    tx: Prisma.TransactionClient,
  ): Promise<Client> {
    const client: Client = await tx.client.create({
      data: {
        name,
      },
    });
    return client;
  }
  async findClientById(id: string): Promise<Client | null> {
    const client: Client | null = await this.prismaService.client.findUnique({
      where: { id },
    });
    return client;
  }
}
