import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable } from '@nestjs/common';
import { Account } from '@prisma/client';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }
  async validate(email: string, password: string) {
    const account: Account | null =
      await this.authService.validateUserWithCredentials(email, password);
    if (!account) {
      throw new Error('Invalid credentials');
    }
    return account;
  }
}
