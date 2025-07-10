import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Account } from '@prisma/client';
import CreateLocalUserDto from 'src/common/dtos/create-local-user.dto';
import loginLocalUserDto from 'src/common/dtos/login-local-user.dto';

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
    if (!account) {
      return null;
    }
    const accessToken = await this.authService.generateAccessToken(account.id);
    const refreshToken = await this.authService.generateRefreshToken(account);
    return { accessToken, refreshToken };
  }
  @Post('login')
  async login(@Body() loginLocalUserDto: loginLocalUserDto) {
    const account: Account =
      await this.authService.validateUserWithCredentials(loginLocalUserDto);
    const accessToken = await this.authService.generateAccessToken(account.id);
    const refreshToken = await this.authService.generateRefreshToken(account);
    return { accessToken, refreshToken };
  }
}
