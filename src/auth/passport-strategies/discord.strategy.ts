import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-discord';
import { Request } from 'express';
import { Role } from 'src/common/enums/role.enum';
import { AuthService } from '../auth.service';
import { Account } from '@prisma/client';
import DiscordPayload from 'src/common/interfaces/discord-payload';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      callbackURL: process.env.DISCORD_CALLBACK_URL!,
      scope: ['identify', 'email'],
      passReqToCallback: true,
    });
  }
  async validate(
    request: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    const { id, email } = profile;
    if (!email) {
      throw new BadRequestException(
        'Email is required for Discord authentication',
      );
    } else {
      let account: Account | null =
        await this.authService.validateUserWithDiscord(email, id);
      if (!account) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { role } = JSON.parse(request.query.state as string);
        if (role != Role.CLIENT && role != Role.COACH) {
          throw new BadRequestException('Invalid role');
        }

        const discordPayload: DiscordPayload =
          this.authService.buildDiscordPayload(profile, role as Role);
        account = await this.authService.registerWithDiscord(discordPayload);
      }
      return account;
    }
  }
  authenticate(req: Request, options: any) {
    const role = req.query.role;

    const state = JSON.stringify({ role });
    console.log('State:', state);
    super.authenticate(req, { ...options, state });
  }
}
