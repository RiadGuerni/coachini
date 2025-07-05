import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('auth/discord')
export class DiscordAuthController {
  @Get()
  @UseGuards(AuthGuard('discord'))
  discordAuth() {
    // This method is used to initiate the Discord authentication process.
    // The actual redirection to Discord is handled by the Passport strategy.
  }
  @Get('redirect')
  @UseGuards(AuthGuard('discord'))
  discordAuthRedirect(@Req() req: Request) {
    return req.user;
  }
}
