import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Account } from '@prisma/client';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Controller('auth/discord')
export class DiscordAuthController {
  constructor(private readonly authService: AuthService) {}
  @Get()
  @UseGuards(AuthGuard('discord'))
  discordAuth() {
    // This method is used to initiate the Discord authentication process.
    // The actual redirection to Discord is handled by the Passport strategy.
  }
  @Get('redirect')
  @UseGuards(AuthGuard('discord'))
  async discordAuthRedirect(@Req() req: Request) {
    const account: Account = req.user as Account;
    const accessToken = await this.authService.generateAccessToken(account.id);
    const refreshToken = await this.authService.generateRefreshToken(account);
    return { accessToken, refreshToken };
  }
}
