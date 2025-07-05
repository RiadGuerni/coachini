import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientModule } from 'src/client/client.module';
import { AccountModule } from 'src/account/account.module';
import { CoachModule } from 'src/coach/coach.module';
import { PassportModule } from '@nestjs/passport';
import { LocalAuthController } from './controllers/local-auth.controller';
import { LocalStrategy } from './passport-strategies/local.strategy';
import { GoogleStrategy } from './passport-strategies/google.strategy';
import { GoogleAuthController } from './controllers/google-auth.controller';
import { DiscordAuthController } from './controllers/discord-auth.controller';
import { DiscordStrategy } from './passport-strategies/discord.strategy';

@Module({
  imports: [ClientModule, AccountModule, CoachModule, PassportModule],
  providers: [AuthService, LocalStrategy, GoogleStrategy, DiscordStrategy],
  controllers: [
    LocalAuthController,
    GoogleAuthController,
    DiscordAuthController,
  ],
})
export class AuthModule {}
