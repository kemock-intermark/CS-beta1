import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, IsDateString } from 'class-validator';
import { z } from 'zod';

export class CreateReservationDto {
  @ApiProperty({ description: 'Event ID', required: false })
  @IsString()
  @IsOptional()
  eventId?: string;

  @ApiProperty({ description: 'Table ID', required: false })
  @IsString()
  @IsOptional()
  tableId?: string;

  @ApiProperty({ description: 'Package ID', required: false })
  @IsString()
  @IsOptional()
  packageId?: string;

  @ApiProperty({ description: 'Number of guests', minimum: 1 })
  @IsInt()
  @Min(1)
  guestCount: number;

  @ApiProperty({ description: 'Reservation date', example: '2024-01-15T22:00:00Z' })
  @IsDateString()
  reservationDate: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export const createReservationSchema = z.object({
  eventId: z.string().uuid().optional(),
  tableId: z.string().uuid().optional(),
  packageId: z.string().uuid().optional(),
  guestCount: z.number().int().min(1),
  reservationDate: z.string().datetime(),
  notes: z.string().optional(),
});

export type CreateReservationSchema = z.infer<typeof createReservationSchema>;
