import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
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
import loginLocalUserDto from 'src/common/dtos/login-local-user.dto';
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
  private readonly logger = new Logger(AuthService.name);
  async registerWithCredentials(
    createLocalUserDto: CreateLocalUserDto,
  ): Promise<Account> {
    let user: Client | Coach;
    let account: Account | null;
    const { email } = createLocalUserDto;
    try {
      account = await this.accountService.findAccountByEmail(email);
      if (account) {
        throw new ConflictException('Email already in use');
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
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(err.message);
      throw new InternalServerErrorException('Failed to register user ');
    }
  }

  async validateUserWithCredentials(
    loginLocalUserDto: loginLocalUserDto,
  ): Promise<Account> {
    const { email, password } = loginLocalUserDto;
    try {
      const account: Account | null =
        await this.accountService.findAccountByEmail(email);
      if (!account) {
        throw new ConflictException('invalid email');
      } else if (!account.password) {
        // This account was created with Google or Discord, so no password is set
        throw new ConflictException(
          'This account was created with Google or Discord not with credentials',
        );
      } else {
        const isPasswordValid = await this.hashService.comparePassword(
          password,
          account.password,
        );
        if (!isPasswordValid) {
          throw new ConflictException('invalid password');
        } else {
          return account;
        }
      }
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(err.message);
      throw new InternalServerErrorException('Failed to login user');
    }
  }

  async validateUserWithGoogle(
    email: string,
    googleId: string,
  ): Promise<Account | null> {
    try {
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
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(err.message);
      throw new InternalServerErrorException('Failed to login with Google');
    }
  }
  async validateUserWithDiscord(
    email: string,
    discordId: string,
  ): Promise<Account | null> {
    try {
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
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(err.message);
      throw new InternalServerErrorException('Failed to login with Discord');
    }
  }
  async validateUserById(id: string): Promise<Account | null> {
    try {
      return await this.accountService.findAccountById(id);
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(err.message);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async registerWithGoogle(googlePayload: GooglePayload): Promise<Account> {
    let user: Client | Coach;
    try {
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
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(err.message);
      throw new InternalServerErrorException('Failed to register with Google');
    }
  }
  async registerWithDiscord(discordPayload: DiscordPayload): Promise<Account> {
    try {
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
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(error.message);
      throw new InternalServerErrorException('Failed to register with Discord');
    }
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
    try {
      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
        secret: process.env.ACCESS_TOKEN_SECRET!,
      });
      return accessToken;
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(err.message);
      throw new InternalServerErrorException('Failed to generate access token');
    }
  }
  async generateRefreshToken(account: Account): Promise<string> {
    const userId = account.id;
    const payload = { userId };
    try {
      const refreshToken: string = await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.REFRESH_TOKEN_SECRET!,
      });
      account.refreshToken = refreshToken;
      await this.accountService.updateAccount(account);
      return refreshToken;
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(err.message);
      throw new InternalServerErrorException(
        'Failed to generate refresh token',
      );
    }
  }
  async validateRefreshToken(token: string): Promise<Account> {
    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret: process.env.REFRESH_TOKEN_SECRET!,
      });
      const { userId } = payload;
      if (!userId) {
        throw new Error('no userId in token');
      }
      const account: Account | null =
        await this.accountService.findAccountById(userId);
      if (!account) {
        throw new Error('Account not found');
      } else {
        if (account.refreshToken != token) {
          throw new Error('Refresh token in account does not match');
        }
        return account;
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(err.message);
      throw new BadRequestException('Invalid refresh token');
    }
  }
}
