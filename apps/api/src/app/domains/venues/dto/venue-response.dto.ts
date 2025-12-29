import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class VenueResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  declare id: string;

  @ApiProperty({
    description: 'The name of the venue',
    example: 'Madison Square Garden',
  })
  @Expose()
  declare name: string;

  @ApiProperty({
    description: 'The physical address of the venue',
    example: '4 Pennsylvania Plaza, New York, NY 10001',
  })
  @Expose()
  declare address: string;
}
