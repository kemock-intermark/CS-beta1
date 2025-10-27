import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsInt, Min } from 'class-validator';
import { z } from 'zod';

export class CreateLeadDto {
  @ApiProperty({ description: 'Guest first name' })
  @IsString()
  firstName!: string;

  @ApiProperty({ description: 'Guest last name' })
  @IsString()
  lastName!: string;

  @ApiProperty({ description: 'Guest phone', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Guest email', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Event ID', required: false })
  @IsString()
  @IsOptional()
  eventId?: string;

  @ApiProperty({ description: 'Expected guest count', required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  guestCount?: number;
}

export const createLeadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  eventId: z.string().uuid().optional(),
  guestCount: z.number().int().min(1).optional(),
});

export type CreateLeadSchema = z.infer<typeof createLeadSchema>;
