import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientModule } from 'src/client/client.module';
import { AccountModule } from 'src/account/account.module';
import { CoachModule } from 'src/coach/coach.module';
import { PassportModule } from '@nestjs/passport';
import { LocalAuthController } from './controllers/local-auth.controller';
import { GoogleStrategy } from './passport-strategies/google.strategy';
import { GoogleAuthController } from './controllers/google-auth.controller';
import { DiscordAuthController } from './controllers/discord-auth.controller';
import { DiscordStrategy } from './passport-strategies/discord.strategy';
import { JwtStrategy } from './passport-strategies/jwt.strategy';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [ClientModule, AccountModule, CoachModule, PassportModule],
  providers: [AuthService, GoogleStrategy, DiscordStrategy, JwtStrategy],
  controllers: [
    AuthController,
    LocalAuthController,
    GoogleAuthController,
    DiscordAuthController,
  ],
})
export class AuthModule {}
