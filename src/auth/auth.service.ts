import { Injectable } from '@nestjs/common';
import { Role } from 'src/common/enums/role.enum';
import { HashService } from 'src/shared/hash.service';
import { Account, Client, Coach, Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma.service';
import { ClientService } from 'src/client/client.service';
import { CoachService } from 'src/coach/coach.service';
import { AccountService } from 'src/account/account.service';
import { Profile as GoogleProfile } from 'passport-google-oauth20';
import { Profile as DiscordProfile } from 'passport-discord';
import GooglePayload from 'src/common/interfaces/google-payload';
import DiscordPayload from 'src/common/interfaces/discord-payload';
import CreateLocalUserDto from '../common/dtos/create-local-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/common/interfaces/jwt-payload';
@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly clientService: ClientService,
    private readonly coachService: CoachService,
    private readonly accountService: AccountService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}
  async registerWithCredentials(
    createLocalUserDto: CreateLocalUserDto,
  ): Promise<Account | null> {
    let user: Client | Coach;
    let account: Account | null;
    const { email } = createLocalUserDto;
    account = await this.accountService.findAccountByEmail(email);
    if (account) {
      return null;
    }
    account = await this.prismaService.$transaction(async (tx) => {
      user = await this.createUserFromLocal(createLocalUserDto, tx);
      createLocalUserDto.userId = user.id;
      const account = this.accountService.createAccountWithCredentials(
        createLocalUserDto,
        tx,
      );
      return account;
    });
    return account;
  }

  async validateUserWithCredentials(
    email: string,
    password: string,
  ): Promise<Account | null> {
    const account: Account | null =
      await this.accountService.findAccountByEmail(email);
    if (!account || !account.password) {
      return null;
    } else {
      const isPasswordValid = await this.hashService.comparePassword(
        password,
        account.password,
      );
      if (!isPasswordValid) {
        return null;
      } else {
        return account;
      }
    }
  }

  async validateUserWithGoogle(
    email: string,
    googleId: string,
  ): Promise<Account | null> {
    let account: Account | null =
      await this.accountService.findAccountByEmail(email);
    if (!account) {
      return null;
    } else {
      if (!account.googleId) {
        // first time login with google
        account.googleId = googleId;
        account = await this.accountService.updateAccount(account);
      }
      return account;
    }
  }
  async validateUserWithDiscord(
    email: string,
    discordId: string,
  ): Promise<Account | null> {
    let account: Account | null =
      await this.accountService.findAccountByEmail(email);
    if (!account) {
      return null;
    } else {
      if (!account.discordId) {
        // first time login with discord
        account.discordId = discordId;
        account = await this.accountService.updateAccount(account);
      }
      return account;
    }
  }
  async validateUserById(id: string): Promise<Account | null> {
    return await this.accountService.findAccountById(id);
  }

  async registerWithGoogle(googlePayload: GooglePayload): Promise<Account> {
    let user: Client | Coach;
    const account: Account = await this.prismaService.$transaction(
      async (tx) => {
        user = await this.createUserFromGoogle(googlePayload, tx);
        googlePayload.userId = user.id;
        const account = await this.accountService.createAccountWithGoogle(
          googlePayload,
          tx,
        );
        return account;
      },
    );
    return account;
  }
  async registerWithDiscord(discordPayload: DiscordPayload): Promise<Account> {
    let user: Client | Coach;
    const account: Account = await this.prismaService.$transaction(
      async (tx) => {
        user = await this.createUserFromDiscord(discordPayload, tx);
        discordPayload.userId = user.id;
        const account = await this.accountService.createAccountWithDiscord(
          discordPayload,
          tx,
        );
        return account;
      },
    );
    return account;
  }
  // This method is used to create a user (Client or Coach) within a transaction.
  async createUserFromLocal(
    createLocalUserDto: CreateLocalUserDto,
    tx: Prisma.TransactionClient,
  ): Promise<Client | Coach> {
    let user: Client | Coach;
    const { role, name } = createLocalUserDto;
    if (role == Role.CLIENT) {
      user = await this.clientService.createClient(name, tx);
    } else {
      user = await this.coachService.createCoach(name, tx);
    }
    return user;
  }

  async createUserFromGoogle(
    googlePayload: GooglePayload,
    tx: Prisma.TransactionClient,
  ): Promise<Client | Coach> {
    let user: Client | Coach;
    const { role, name } = googlePayload;
    if (role == Role.CLIENT) {
      user = await this.clientService.createClient(name, tx);
    } else {
      user = await this.coachService.createCoach(name, tx);
    }
    return user;
  }
  async createUserFromDiscord(
    discordPayload: DiscordPayload,
    tx: Prisma.TransactionClient,
  ) {
    let user: Client | Coach;
    const { role, name } = discordPayload;
    if (role == Role.CLIENT) {
      user = await this.clientService.createClient(name, tx);
    } else {
      user = await this.coachService.createCoach(name, tx);
    }
    return user;
  }

  buildGooglePayload(googleProfile: GoogleProfile, role: Role): GooglePayload {
    const { displayName, id, emails } = googleProfile;
    const email = emails![0].value;
    const googlePayload: GooglePayload = {
      name: displayName,
      googleId: id,
      email,
      role,
      userId: null,
    };
    return googlePayload;
  }
  buildDiscordPayload(
    discordProfile: DiscordProfile,
    role: Role,
  ): DiscordPayload {
    const { username, id, email } = discordProfile;
    const discordPayload: DiscordPayload = {
      name: username,
      discordId: id,
      email: email!,
      role,
      userId: null,
    };
    return discordPayload;
  }
  async generateAccessToken(userId: string): Promise<string> {
    const payload = { userId };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: process.env.ACCESS_TOKEN_SECRET!,
    });
    return accessToken;
  }
  async generateRefreshToken(account: Account): Promise<string> {
    const userId = account.id;
    const payload = { userId };
    const refreshToken: string = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.REFRESH_TOKEN_SECRET!,
    });
    account.refreshToken = refreshToken;
    await this.accountService.updateAccount(account);
    return refreshToken;
  }
  async validateRefreshToken(token: string): Promise<Account> {
    const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
      secret: process.env.REFRESH_TOKEN_SECRET!,
    });
    const { userId } = payload;
    if (!userId) {
      throw new Error('Invalid token');
    }
    const account: Account | null =
      await this.accountService.findAccountById(userId);
    if (!account) {
      throw new Error('Account not found');
    } else {
      if (account.refreshToken != token) {
        throw new Error('Invalid token');
      }
      return account;
    }
  }
}
