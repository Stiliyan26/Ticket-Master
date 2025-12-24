import { Column, Entity, ManyToOne, Unique, VersionColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base-entity';
import { Event } from '../../events/entities/event.entity';
import { Seat } from '../../seats/entities/seat.entity';
import { Booking } from '../../bookings/entities/booking.entity';

export enum TicketStatus {
  AVAILABLE = 'AVAILABLE',
  HELD = 'HELD',
  SOLD = 'SOLD',
}

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

  @Column({ type: 'timestamp', nullable: true })
  declare heldAt: Date | null;

  @ManyToOne(() => Event, { nullable: false, onDelete: 'CASCADE' })
  declare event: Event;

  @ManyToOne(() => Seat, { nullable: false, onDelete: 'CASCADE' })
  declare seat: Seat;

  // If a booking is deleted/cancelled, tickets should become available again (not deleted).
  @ManyToOne(() => Booking, { nullable: true, onDelete: 'SET NULL' })
  declare booking?: Booking;
}
