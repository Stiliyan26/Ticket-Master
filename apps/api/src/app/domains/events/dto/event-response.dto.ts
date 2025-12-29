import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { EventStatus } from '../entities/event.entity';

@Exclude()
export class EventResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  declare id: string;

  @ApiProperty({
    description: 'The name of the event',
    example: 'Rock Concert 2024',
  })
  @Expose()
  declare name: string;

  @ApiProperty({
    description: 'The date and time of the event',
    example: '2024-12-31T20:00:00Z',
  })
  @Expose()
  declare date: Date;

  @ApiProperty({
    description: 'The base price for tickets',
    example: 49.99,
  })
  @Expose()
  declare basePrice: number;

  @ApiProperty({
    enum: EventStatus,
    description: 'The current status of the event',
  })
  @Expose()
  declare status: EventStatus;

  @ApiProperty({
    description: 'The venue ID where the event is hosted',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  @Transform(({ obj }) => obj.venue?.id)
  declare venueId: string;

  @ApiProperty({
    description: 'The name of the venue',
    example: 'Madison Square Garden',
  })
  @Expose()
  @Transform(({ obj }) => obj.venue?.name)
  declare venueName: string;
}
