import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class SeatResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  declare id: string;

  @ApiProperty({
    description: 'The section of the seat',
    example: 'A',
  })
  @Expose()
  declare section: string;

  @ApiProperty({
    description: 'The row of the seat',
    example: '1',
  })
  @Expose()
  declare row: string;

  @ApiProperty({
    description: 'The number of the seat',
    example: 15,
  })
  @Expose()
  declare number: number;

  @ApiProperty({
    description: 'The venue ID',
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
