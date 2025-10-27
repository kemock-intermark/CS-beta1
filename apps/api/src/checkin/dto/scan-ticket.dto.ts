import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { z } from 'zod';

export class ScanTicketDto {
  @ApiProperty({ description: 'QR code from ticket' })
  @IsString()
  @IsNotEmpty()
  qrCode!: string;
}

export const scanTicketSchema = z.object({
  qrCode: z.string().min(1),
});

export type ScanTicketSchema = z.infer<typeof scanTicketSchema>;
