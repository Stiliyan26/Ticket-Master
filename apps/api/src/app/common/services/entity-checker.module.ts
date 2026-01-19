import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../../domains/events/entities/event.entity';
import { EntityCheckerService } from './entity-checker.service';

@Module({
    imports: [TypeOrmModule.forFeature([Event])],
    providers: [EntityCheckerService],
    exports: [EntityCheckerService],
})
export class EntityCheckerModule { }

