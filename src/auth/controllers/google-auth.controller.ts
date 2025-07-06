import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Account } from '@prisma/client';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(private readonly authService: AuthService) {}
  @Get()
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // This method is used to initiate the Google authentication process.
    // The actual redirection to Google is handled by the Passport strategy.
  }
  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request) {
    const account = req.user as Account;
    const accessToken = await this.authService.generateAccessToken(account.id);
    const refreshToken = await this.authService.generateRefreshToken(account);
    return { accessToken, refreshToken };
  }
}
