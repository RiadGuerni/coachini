import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Client, Coach } from '@prisma/client';
import { Injectable } from '@nestjs/common';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }
  async validate(email: string, password: string) {
    const user: Client | Coach | null =
      await this.authService.validateUserWithCredentials(email, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return user;
  }
}
