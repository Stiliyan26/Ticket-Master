import { Exclude, Expose, Type, Transform } from 'class-transformer';
import { EventStatus } from '../entities/event.entity';
import { Venue } from '../../venues/entities/venue.entity';

@Exclude()
export class EventResultDto {
  @Expose()
  declare id: string;

  @Expose()
  declare name: string;

  @Expose()
  declare date: Date;

  @Expose()
  @Transform(({ value }) => Number(value))
  declare basePrice: number;

  @Expose()
  declare status: EventStatus;

  @Expose()
  @Type(() => Venue)
  declare venue: Venue;

  @Expose()
  declare createdAt: Date;

  @Expose()
  declare updatedAt: Date;
}
