import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsISO8601, IsInt, Min } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ description: 'Venue ID' })
  @IsString()
  venueId!: string;

  @ApiProperty({ description: 'Hall ID', required: false })
  @IsString()
  @IsOptional()
  hallId?: string;

  @ApiProperty({ description: 'Event name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Event description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Event date (ISO8601)' })
  @IsISO8601()
  date!: string;

  @ApiProperty({ description: 'Start time (ISO8601)' })
  @IsISO8601()
  startTime!: string;

  @ApiProperty({ description: 'End time (ISO8601)' })
  @IsISO8601()
  endTime!: string;

  @ApiProperty({ description: 'Capacity', required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  capacity?: number;

  @ApiProperty({ description: 'Cover charge as string number (e.g., 25.00)', required: false })
  @IsString()
  @IsOptional()
  coverCharge?: string;
}
