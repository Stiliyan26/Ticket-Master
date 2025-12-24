import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @ApiProperty({
    description: 'Timestamp when the record was created',
  })
  @CreateDateColumn()
  declare createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the record was last updated',
  })
  @UpdateDateColumn()
  declare updatedAt: Date;
}
