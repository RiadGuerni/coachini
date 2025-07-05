import { Global, Module } from '@nestjs/common';
import { HashService } from './hash.service';
import { PrismaService } from 'src/shared/prisma.service';

@Global()
@Module({
  providers: [HashService, PrismaService],
  exports: [HashService, PrismaService],
})
export class SharedModule {}
