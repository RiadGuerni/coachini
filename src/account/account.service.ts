import { Injectable } from '@nestjs/common';
import { Account, Prisma } from '@prisma/client';
import CreateLocalUserDto from 'src/common/dtos/create-local-user.dto';
import DiscordPayload from 'src/common/interfaces/discord-payload';
import GooglePayload from 'src/common/interfaces/google-payload';
import { HashService } from 'src/shared/hash.service';
import { PrismaService } from 'src/shared/prisma.service';

@Injectable()
export class AccountService {
  constructor(
    private readonly hashService: HashService,
    private readonly prismaService: PrismaService,
  ) {}

  async createAccountWithCredentials(
    createLocalUserDto: CreateLocalUserDto,
    tx: Prisma.TransactionClient,
  ): Promise<Account> {
    const { email, password, userId, role } = createLocalUserDto;
    const hashedPassword: string =
      await this.hashService.hashPassword(password);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const roleId = `${role}Id` as 'clientId' | 'coachId';
    const account = await tx.account.create({
      data: {
        email: email,
        password: hashedPassword,
        [roleId]: userId!,
        role,
      },
    });
    return account;
  }
  async createAccountWithGoogle(
    googlePayload: GooglePayload,
    tx: Prisma.TransactionClient,
  ): Promise<Account> {
    const { email, googleId, userId, role } = googlePayload;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const roleId = `${role}Id` as 'clientId' | 'coachId';

    const account = await tx.account.create({
      data: {
        email: email,
        googleId,
        [roleId]: userId,
        role,
      },
    });
    return account;
  }
  async createAccountWithDiscord(
    discordPayload: DiscordPayload,
    tx: Prisma.TransactionClient,
  ): Promise<Account> {
    const { email, discordId, userId, role } = discordPayload;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const roleId = `${role}Id` as 'clientId' | 'coachId';

    const account = await tx.account.create({
      data: {
        email: email,
        discordId,
        [roleId]: userId,
        role,
      },
    });
    return account;
  }
  async findAccountByEmail(email: string): Promise<Account | null> {
    const account: Account | null = await this.prismaService.account.findUnique(
      { where: { email } },
    );
    return account;
  }
  async findAccountById(id: string): Promise<Account | null> {
    const account: Account | null = await this.prismaService.account.findUnique(
      {
        where: { id },
      },
    );
    return account;
  }
  async updateAccount(account: Account): Promise<Account> {
    const updatedAccount: Account = await this.prismaService.account.update({
      where: { id: account.id },
      data: account,
    });
    return updatedAccount;
  }
}
