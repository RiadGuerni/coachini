import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('auth/google')
export class GoogleAuthController {
  @Get()
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // This method is used to initiate the Google authentication process.
    // The actual redirection to Google is handled by the Passport strategy.
  }
  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: Request) {
    return req.user;
  }
}
