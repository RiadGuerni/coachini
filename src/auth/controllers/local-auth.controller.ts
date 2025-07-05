import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Account } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import CreateLocalUserDto from 'src/common/dtos/create-local-user.dto';

@Controller('auth/local')
export class LocalAuthController {
  @Get()
  getHello(): string {
    return 'Hello from LocalAuthController!';
  }
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  async register(@Body() createLocalUserDto: CreateLocalUserDto) {
    const account: Account | null =
      await this.authService.registerWithCredentials(createLocalUserDto);
    return account;
  }
  @Post('login')
  @UseGuards(AuthGuard('local'))
  login(@Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return req.user;
  }
}
