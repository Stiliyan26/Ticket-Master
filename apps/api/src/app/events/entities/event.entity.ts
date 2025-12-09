import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base-entity';
import { Venue } from '../../venues/entities/venue.entity';

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
}

@Entity('events')
export class Event extends BaseEntity {
  @Column()
  declare name: string;

  @Column({ type: 'timestamp' })
  declare date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  declare basePrice: number;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  declare status: EventStatus;

  @ManyToOne(() => Venue, { nullable: false })
  // 🚨 IMPORTANT: Required venue relationship - events must belong to a venue
  declare venue: Venue;
}
