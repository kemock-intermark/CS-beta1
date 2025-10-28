import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('tg/webapp/validate')
  @ApiOperation({ summary: 'Validate Telegram initData and issue JWT' })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid initData',
  })
  async validateTelegramWebApp(@Body() dto: TelegramAuthDto) {
    return this.authService.validateTelegramWebApp(dto.initData);
  }

  @Post('browser-login')
  @ApiOperation({ summary: 'Dev-only browser login with shared secret' })
  @ApiResponse({ status: 200, description: 'JWT issued' })
  async browserLogin(@Body() body: { username: string; secret: string }) {
    if (!body?.username || !body?.secret) {
      throw new BadRequestException('username and secret are required');
    }
    return this.authService.browserLogin(body.username, body.secret);
  }
}
