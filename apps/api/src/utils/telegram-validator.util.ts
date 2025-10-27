import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

export class TelegramValidator {
  constructor(private configService: ConfigService) {}

  validateInitData(initData: string): boolean {
    const BOT_TOKEN = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    if (!BOT_TOKEN) {
      return false;
    }

    try {
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');

      if (!hash) {
        return false;
      }

      // Remove hash from params
      urlParams.delete('hash');

      // Create data check string
      const dataCheckString = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      // Create secret key
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(BOT_TOKEN)
        .digest();

      // Create hash
      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      return calculatedHash === hash;
    } catch (error) {
      console.error('Error validating Telegram initData:', error);
      return false;
    }
  }

  parseInitData(initData: string): any {
    const urlParams = new URLSearchParams(initData);
    const user = urlParams.get('user');
    const authDate = urlParams.get('auth_date');
    const hash = urlParams.get('hash');

    return {
      user: user ? JSON.parse(user) : null,
      authDate: authDate ? parseInt(authDate, 10) : null,
      hash: hash || '',
    };
  }
}
