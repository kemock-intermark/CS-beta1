import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private redis: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (redisUrl) {
      this.redis = new Redis(redisUrl);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  async check() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      db: false,
      redis: false,
    };

    // Check database
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      health.db = true;
    } catch (error) {
      health.db = false;
    }

    // Check Redis
    if (this.redis) {
      try {
        await this.redis.ping();
        health.redis = true;
      } catch (error) {
        health.redis = false;
      }
    }

    return health;
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.disconnect();
    }
  }
}
