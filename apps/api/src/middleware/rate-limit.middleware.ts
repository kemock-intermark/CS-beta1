import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private redis: Redis;
  private readonly windowMs = 60 * 1000; // 1 minute
  private readonly maxRequests = 60; // 60 requests per minute

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const key = this.getKey(req);
    
    try {
      const current = await this.redis.incr(key);
      
      if (current === 1) {
        await this.redis.expire(key, Math.ceil(this.windowMs / 1000));
      }

      const remaining = Math.max(0, this.maxRequests - current);
      
      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Date.now() + this.windowMs);

      if (current > this.maxRequests) {
        res.status(429).json({
          statusCode: 429,
          message: 'Too Many Requests',
          error: 'Rate limit exceeded',
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      // If Redis fails, allow the request
      next();
    }
  }

  private getKey(req: Request): string {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const path = req.path;
    return `ratelimit:${ip}:${path}`;
  }
}
