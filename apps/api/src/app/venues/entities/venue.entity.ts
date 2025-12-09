import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base-entity';
import { Seat } from '../../seats/entities/seat.entity';
import { Event } from '../../events/entities/event.entity';

type SafeUniqueFields = keyof Pick<Venue, 'name'>;

@Unique(['name'] as SafeUniqueFields[])
@Entity('venues')
export class Venue extends BaseEntity {
  @Column()
  declare name: string;

  @Column()
  declare address: string;

  @OneToMany(() => Seat, (seat) => seat.venue)
  declare seats: Seat[];

  @OneToMany(() => Event, (event) => event.venue)
  declare events: Event[];
}
