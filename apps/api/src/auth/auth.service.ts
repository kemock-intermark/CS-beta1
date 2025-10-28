import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramValidator } from '../utils/telegram-validator.util';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private telegramValidator: TelegramValidator;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.telegramValidator = new TelegramValidator(configService);
  }

  async validateTelegramWebApp(initData: string) {
    // Validate Telegram initData (HMAC-SHA256 validation)
    const isValid = this.telegramValidator.validateInitData(initData);

    if (!isValid) {
      throw new UnauthorizedException('Invalid Telegram initData');
    }

    // Extract user data
    const parsedData = this.telegramValidator.parseInitData(initData);

    if (!parsedData?.user) {
      throw new UnauthorizedException('User data not found in initData');
    }

    const telegramUser = parsedData.user;
    const telegramId = telegramUser.id.toString();

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId,
          firstName: telegramUser.first_name || null,
          lastName: telegramUser.last_name || null,
          username: telegramUser.username || null,
          role: 'USER',
          isActive: true,
        },
      });

      console.log(`✅ Created new user: ${user.id} (${telegramId})`);
    } else {
      // Update user data if changed
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: telegramUser.first_name || user.firstName,
          lastName: telegramUser.last_name || user.lastName,
          username: telegramUser.username || user.username,
        },
      });
    }

    // Determine role based on user settings
    const userRole = this.determineUserRole(user);

    // Generate JWT token with role
    const token = this.jwtService.sign(
      {
        userId: user.id,
        telegramId: user.telegramId,
        username: user.username,
        role: userRole,
      },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '7d',
      }
    );

    return {
      accessToken: token,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: userRole,
      },
    };
  }

  private determineUserRole(user: any): string {
    // In production, this would check user.role from DB
    // For now, map from DB role to JWT role
    const roleMap: Record<string, string> = {
      USER: 'guest',
      VIP: 'guest',
      PREMIUM: 'guest',
      ADMIN: 'admin',
    };

    return roleMap[user.role] || 'guest';
  }

  async verifyToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async browserLogin(username: string, secret: string) {
    const allowed = this.configService.get<string>('BROWSER_LOGIN_SECRET');
    if (!allowed || secret !== allowed) {
      throw new UnauthorizedException('Invalid secret');
    }

    const user = await this.prisma.user.findFirst({ where: { username } });
    if (!user) {
      // If user doesn't exist, create a new ADMIN user with this username
      const newUser = await this.prisma.user.create({
        data: {
          telegramId: `browser_${username}`,
          username,
          firstName: username,
          role: 'ADMIN',
          isActive: true,
        },
      });
      const token = this.jwtService.sign(
        {
          userId: newUser.id,
          telegramId: newUser.telegramId,
          username: newUser.username,
          role: 'admin',
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '7d',
        }
      );
      return { accessToken: token };
    }

    const token = this.jwtService.sign(
      {
        userId: user.id,
        telegramId: user.telegramId,
        username: user.username,
        role: this.determineUserRole(user),
      },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '7d',
      }
    );

    return { accessToken: token };
  }
}