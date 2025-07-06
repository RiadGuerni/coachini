import { Global, Module } from '@nestjs/common';
import { HashService } from './hash.service';
import { PrismaService } from 'src/shared/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET!, // default secret fallback
    }),
  ],
  providers: [HashService, PrismaService],
  exports: [HashService, PrismaService, JwtModule],
})
export class SharedModule {}
