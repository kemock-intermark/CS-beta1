import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { z } from 'zod';

export class CreateTicketDto {
  @ApiProperty({ description: 'Event ID' })
  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @ApiProperty({ description: 'Ticket type', example: 'VIP' })
  @IsString()
  @IsNotEmpty()
  type!: string;
}

export const createTicketSchema = z.object({
  eventId: z.string().uuid(),
  type: z.string().min(1),
});

export type CreateTicketSchema = z.infer<typeof createTicketSchema>;
