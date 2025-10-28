import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, IsNumberString } from 'class-validator';

export class CreatePackageDto {
  @ApiProperty({ description: 'Event ID' })
  @IsString()
  eventId!: string;

  @ApiProperty({ description: 'Package name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Package description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Price as string (e.g., 1500.00)' })
  @IsNumberString()
  price!: string;

  @ApiProperty({ description: 'Minimum guests', required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  minGuests?: number;

  @ApiProperty({ description: 'Maximum guests', required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxGuests?: number;

  @ApiProperty({ description: 'Bottles JSON', required: false })
  @IsOptional()
  bottles?: any;

  @ApiProperty({ description: 'Amenities JSON', required: false })
  @IsOptional()
  amenities?: any;
}

