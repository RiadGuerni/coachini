import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../shared/shared.module';
import { AccountModule } from '../account/account.module';
import { ClientModule } from '../client/client.module';
import { CoachModule } from '../coach/coach.module';

@Module({
  imports: [AuthModule, SharedModule, AccountModule, ClientModule, CoachModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
