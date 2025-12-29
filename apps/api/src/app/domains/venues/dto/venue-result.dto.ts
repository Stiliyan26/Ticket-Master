import { Exclude, Expose, Type } from 'class-transformer';
import { Seat } from '../../seats/entities/seat.entity';
import { Event } from '../../events/entities/event.entity';

@Exclude()
export class VenueResultDto {
  @Expose()
  declare id: string;

  @Expose()
  declare name: string;

  @Expose()
  declare address: string;

  @Expose()
  @Type(() => Seat)
  declare seats: Seat[];

  @Expose()
  @Type(() => Event)
  declare events: Event[];

  @Expose()
  declare createdAt: Date;

  @Expose()
  declare updatedAt: Date;
}
