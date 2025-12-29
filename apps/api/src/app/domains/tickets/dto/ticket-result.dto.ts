import { Exclude, Expose, Type, Transform } from 'class-transformer';
import { TicketStatus } from '../entities/ticket.entity';
import { Event } from '../../events/entities/event.entity';
import { Seat } from '../../seats/entities/seat.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Exclude()
export class TicketResultDto {
  @Expose()
  declare id: string;

  @Expose()
  declare status: TicketStatus;

  @Expose()
  @Transform(({ value }) => Number(value))
  declare price: number;

  @Expose()
  declare version: number;

  @Expose()
  declare heldAt: Date | null;

  @Expose()
  @Type(() => Event)
  declare event: Event;

  @Expose()
  @Type(() => Seat)
  declare seat: Seat;

  @Expose()
  @Type(() => Booking)
  declare booking?: Booking;

  @Expose()
  declare createdAt: Date;

  @Expose()
  declare updatedAt: Date;
}
