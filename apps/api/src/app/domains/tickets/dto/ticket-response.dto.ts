import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { TicketStatus } from '../entities/ticket.entity';

@Exclude()
export class TicketResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  declare id: string;

  @ApiProperty({
    enum: TicketStatus,
    description: 'The current status of the ticket',
  })
  @Expose()
  declare status: TicketStatus;

  @ApiProperty({
    description: 'The price of the ticket',
    example: 49.99,
  })
  @Expose()
  declare price: number;

  @ApiProperty({
    description: 'The event ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  @Transform(({ obj }) => obj.event?.id)
  declare eventId: string;

  @ApiProperty({
    description: 'The name of the event',
    example: 'Rock Concert 2024',
  })
  @Expose()
  @Transform(({ obj }) => obj.event?.name)
  declare eventName: string;

  @ApiProperty({
    description: 'The seat ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  @Transform(({ obj }) => obj.seat?.id)
  declare seatId: string;

  @ApiProperty({
    description: 'The section of the seat',
    example: 'A',
  })
  @Expose()
  @Transform(({ obj }) => obj.seat?.section)
  declare seatSection: string;

  @ApiProperty({
    description: 'The row of the seat',
    example: '1',
  })
  @Expose()
  @Transform(({ obj }) => obj.seat?.row)
  declare seatRow: string;

  @ApiProperty({
    description: 'The number of the seat',
    example: 15,
  })
  @Expose()
  @Transform(({ obj }) => obj.seat?.number)
  declare seatNumber: number;

  @ApiProperty({
    description: 'The booking ID (if ticket is sold)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @Expose()
  @Transform(({ obj }) => obj.booking?.id)
  declare bookingId?: string;
}
