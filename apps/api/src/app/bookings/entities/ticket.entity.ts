import { Column, Entity, ManyToOne, Unique, VersionColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base-entity';
import { Event } from '../../events/entities/event.entity';
import { Seat } from '../../seats/entities/seat.entity';
import { Booking } from './booking.entity';

export enum TicketStatus {
  AVAILABLE = 'AVAILABLE',
  HELD = 'HELD',
  SOLD = 'SOLD',
}

// Type-safe unique constraint using keyof - catches renames at compile time!
type TicketUniqueFields = keyof Pick<Ticket, 'event' | 'seat'>;
@Entity('tickets')
@Unique('unique_ticket_per_event_seat', [
  'event',
  'seat',
] as TicketUniqueFields[])
export class Ticket extends BaseEntity {
  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.AVAILABLE,
  })
  declare status: TicketStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  declare price: number;

  @VersionColumn()
  declare version: number;

  @ManyToOne(() => Event, { nullable: false })
  declare event: Event;

  @ManyToOne(() => Seat, { nullable: false })
  declare seat: Seat;

  @ManyToOne(() => Booking, { nullable: true })
  declare booking?: Booking;
}
