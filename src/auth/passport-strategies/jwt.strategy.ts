import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Account } from '@prisma/client';
import { JwtPayload } from 'src/common/interfaces/jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_TOKEN_SECRET!,
    });
  }
  async validate(payload: JwtPayload) {
    const { userId } = payload;
    const account: Account | null =
      await this.authService.validateUserById(userId);
    if (!account) {
      throw new Error('Unauthorized');
    } else {
      return account;
    }
  }
}
