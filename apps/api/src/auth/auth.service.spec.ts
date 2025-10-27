import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { TelegramValidator } from '../utils/telegram-validator.util';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateTelegramWebApp', () => {
    it('should create new user if not exists', async () => {
      const mockInitData = 'user={"id":123456,"first_name":"John"}&auth_date=1234567890&hash=valid_hash';
      const mockUser = { id: 'user-id', telegramId: '123456', role: 'USER' };

      jest.spyOn(service as any, 'telegramValidator', 'get').mockReturnValue({
        validateInitData: jest.fn().mockReturnValue(true),
        parseInitData: jest.fn().mockReturnValue({
          user: { id: 123456, first_name: 'John' },
        }),
      });

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mock-jwt-token');

      const result = await service.validateTelegramWebApp(mockInitData);

      expect(result.accessToken).toBeDefined();
      expect(result.user.telegramId).toBe('123456');
    });

    it('should throw UnauthorizedException for invalid initData', async () => {
      jest.spyOn(service as any, 'telegramValidator', 'get').mockReturnValue({
        validateInitData: jest.fn().mockReturnValue(false),
      });

      await expect(
        service.validateTelegramWebApp('invalid_data')
      ).rejects.toThrow('Invalid Telegram initData');
    });
  });
});
