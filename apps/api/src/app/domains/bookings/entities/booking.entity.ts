import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base-entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { TableName } from '../../../common/enums/table-name.enum';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Entity(TableName.BOOKINGS)
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
