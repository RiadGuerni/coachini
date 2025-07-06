import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Account } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get('hello')
  helloWorld() {
    return 'Hello from AuthController!';
  }
  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    const { refreshToken } = body;
    const account: Account =
      await this.authService.validateRefreshToken(refreshToken);
    const newAccessToken = await this.authService.generateAccessToken(
      account.id,
    );
    return { accessToken: newAccessToken };
  }
  @Get('restricted')
  @UseGuards(AuthGuard('jwt'))
  restricted(@Req() request: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return request.user;
  }
}
