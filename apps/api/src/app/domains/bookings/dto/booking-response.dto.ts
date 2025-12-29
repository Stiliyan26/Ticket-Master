import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { BookingStatus } from '../entities/booking.entity';
import { TicketResponseDto } from '../../tickets/dto/ticket-response.dto';

@Exclude()
export class BookingResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  declare id: string;

  @ApiProperty({
    description: 'The user ID who made the booking',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  declare userId: string;

  @ApiProperty({
    description: 'The total price of the booking',
    example: 149.97,
  })
  @Expose()
  declare totalPrice: number;

  @ApiProperty({
    enum: BookingStatus,
    description: 'The current status of the booking',
  })
  @Expose()
  declare status: BookingStatus;

  @ApiProperty({
    description: 'The tickets in this booking',
    type: [TicketResponseDto],
  })
  @Expose()
  @Type(() => TicketResponseDto)
  declare tickets: TicketResponseDto[];
}
