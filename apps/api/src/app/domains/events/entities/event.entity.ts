import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base-entity';
import { Venue } from '../../venues/entities/venue.entity';
import { ApiProperty } from '@nestjs/swagger';
import { TableName } from '../../../common/enums/table-name.enum';

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
}

@Entity(TableName.EVENTS)
export class Event extends BaseEntity {
  @ApiProperty({
    description: 'The name of the event',
    example: 'Rock Concert 2024',
  })
  @Column()
  declare name: string;

  @ApiProperty({
    description: 'The date and time of the event',
    example: '2024-12-31T20:00:00Z',
  })
  @Column({ type: 'timestamp' })
  declare date: Date;

  @ApiProperty({
    description: 'The base price for tickets',
    example: 49.99,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  declare basePrice: number;

  @ApiProperty({
    enum: EventStatus,
    description: 'The current status of the event',
    default: EventStatus.DRAFT,
  })
  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  declare status: EventStatus;

  @ApiProperty({
    type: () => Venue,
    description: 'The venue where the event is hosted',
  })
  @ManyToOne(() => Venue, { nullable: false, onDelete: 'RESTRICT' })
  declare venue: Venue;
}
