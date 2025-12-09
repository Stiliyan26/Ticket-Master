import { Module, DynamicModule } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';

@Module({})
export class EventsModule {
  static forRoot(): DynamicModule {
    return {
      module: EventsModule,
      imports: [TypeOrmModule.forFeature([Event])],
      controllers: [EventsController],
      providers: [EventsService],
      exports: [EventsService],
      global: false,
    };
  }
}
