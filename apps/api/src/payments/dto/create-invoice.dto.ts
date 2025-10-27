import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsOptional } from 'class-validator';
import { z } from 'zod';

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Reservation ID', required: false })
  @IsString()
  @IsOptional()
  reservationId?: string;

  @ApiProperty({ description: 'Amount', minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ description: 'Currency', default: 'USD' })
  @IsString()
  currency!: string;

  @ApiProperty({ description: 'Description' })
  @IsString()
  description!: string;
}

export const createInvoiceSchema = z.object({
  reservationId: z.string().uuid().optional(),
  amount: z.number().min(0.01),
  currency: z.string().default('USD'),
  description: z.string().min(1),
});

export type CreateInvoiceSchema = z.infer<typeof createInvoiceSchema>;
