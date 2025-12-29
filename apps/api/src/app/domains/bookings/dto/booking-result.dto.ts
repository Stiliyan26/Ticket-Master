import { Exclude, Expose, Type, Transform } from 'class-transformer';
import { BookingStatus } from '../entities/booking.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Exclude()
export class BookingResultDto {
  @Expose()
  declare id: string;

  @Expose()
  declare userId: string;

  @Expose()
  @Transform(({ value }) => Number(value))
  declare totalPrice: number;

  @Expose()
  declare status: BookingStatus;

  @Expose()
  @Type(() => Ticket)
  declare tickets: Ticket[];

  @Expose()
  declare createdAt: Date;
}
