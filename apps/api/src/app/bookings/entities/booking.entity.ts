import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base-entity';
import { Ticket } from './ticket.entity';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Entity('bookings')
export class Booking extends BaseEntity {
  @Column()
  declare userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  declare totalPrice: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  declare status: BookingStatus;

  @OneToMany(() => Ticket, (ticket) => ticket.booking)
  declare tickets: Ticket[];
}
