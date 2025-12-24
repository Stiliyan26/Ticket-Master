import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base-entity';
import { Seat } from '../../seats/entities/seat.entity';
import { Event } from '../../events/entities/event.entity';
import { ApiProperty } from '@nestjs/swagger';

type SafeUniqueFields = keyof Pick<Venue, 'name'>;

@Unique(['name'] as SafeUniqueFields[])
@Entity('venues')
export class Venue extends BaseEntity {
  @ApiProperty({
    description: 'The name of the venue',
    example: 'Madison Square Garden',
  })
  @Column()
  declare name: string;

  @ApiProperty({
    description: 'The physical address of the venue',
    example: '4 Pennsylvania Plaza, New York, NY 10001',
  })
  @Column()
  declare address: string;

  @ApiProperty({
    type: () => [Seat],
    description: 'List of seats available at this venue',
    required: false,
  })
  @OneToMany(() => Seat, (seat) => seat.venue)
  declare seats: Seat[];

  @ApiProperty({
    type: () => [Event],
    description: 'List of events hosted at this venue',
    required: false,
  })
  @OneToMany(() => Event, (event) => event.venue)
  declare events: Event[];
}
