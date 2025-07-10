import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { Account } from '@prisma/client';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }
  async validate(
    request: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    const { emails, id } = profile;
    const email = emails![0].value;
    let account: Account | null = await this.authService.validateUserWithGoogle(
      email,
      id,
    );
    if (!account) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { role } = JSON.parse(request.query.state as string);
      const googlePayload = this.authService.buildGooglePayload(
        profile,
        role as Role,
      );
      account = await this.authService.registerWithGoogle(googlePayload);
    }
    return account;
  }

  authenticate(req: Request, options: any) {
    const role = req.query.role;
    if (role != Role.CLIENT && role != Role.COACH) {
      throw new BadRequestException('Invalid role');
    }
    const state = JSON.stringify({ role });
    super.authenticate(req, { ...options, state });
  }
}
