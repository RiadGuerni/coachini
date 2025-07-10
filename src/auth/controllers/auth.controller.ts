import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Account } from '@prisma/client';
import { RefreshTokenDto } from 'src/common/dtos/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    const account: Account =
      await this.authService.validateRefreshToken(refreshToken);
    const newAccessToken = await this.authService.generateAccessToken(
      account.id,
    );
    return { accessToken: newAccessToken };
  }
  @Post('logout')
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    await this.authService.logout(refreshToken);
    return { message: 'Logged out successfully' };
  }
}
