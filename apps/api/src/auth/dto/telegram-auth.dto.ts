import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { z } from 'zod';

export class TelegramAuthDto {
  @ApiProperty({
    description: 'Telegram initData from WebApp',
    example:
      'user={"id":123456,"first_name":"John"}&auth_date=1234567890&hash=abc123',
  })
  @IsString()
  @IsNotEmpty()
  initData: string;
}

export const telegramAuthSchema = z.object({
  initData: z.string().min(1, 'initData is required'),
});

export type TelegramAuthSchema = z.infer<typeof telegramAuthSchema>;