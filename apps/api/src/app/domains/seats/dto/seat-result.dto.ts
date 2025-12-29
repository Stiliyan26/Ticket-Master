import { Exclude, Expose, Type } from 'class-transformer';
import { Venue } from '../../venues/entities/venue.entity';

@Exclude()
export class SeatResultDto {
  @Expose()
  declare id: string;

  @Expose()
  declare section: string;

  @Expose()
  declare row: string;

  @Expose()
  declare number: number;

  @Expose()
  @Type(() => Venue)
  declare venue: Venue;

  @Expose()
  declare createdAt: Date;

  @Expose()
  declare updatedAt: Date;
}
