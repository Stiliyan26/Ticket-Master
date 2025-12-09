import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base-entity';
import { Venue } from '../../venues/entities/venue.entity';

// Type-safe unique constraint using keyof - catches renames at compile time!
type SeatUniqueFields = keyof Pick<
  Seat,
  'venue' | 'section' | 'row' | 'number'
>;
@Unique('unique_seat_per_venue', [
  'venue',
  'section',
  'row',
  'number',
] as SeatUniqueFields[])
@Entity('seats')
export class Seat extends BaseEntity {
  @Column()
  declare section: string;

  @Column()
  declare row: string;

  @Column()
  declare number: number;

  @ManyToOne(() => Venue, { nullable: false })
  declare venue: Venue;
}
