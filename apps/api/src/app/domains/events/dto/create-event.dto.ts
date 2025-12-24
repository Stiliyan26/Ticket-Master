import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    description: 'The name of the event',
    example: 'Rock Concert 2024',
  })
  @IsNotEmpty()
  @IsString()
  readonly name!: string;

  @ApiProperty({
    description: 'The date and time of the event',
    example: '2024-12-31T20:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  readonly date!: string;

  @ApiProperty({
    description: 'The starting price for a ticket',
    example: 49.99,
  })
  @IsNumber()
  @IsPositive()
  readonly basePrice!: number;

  @ApiProperty({
    description: 'The UUID of the venue where the event will take place',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID(4)
  readonly venueId!: string;
}
