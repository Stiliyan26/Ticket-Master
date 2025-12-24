import { Module, DynamicModule } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { VenuesModule } from '../venues/venues.module';
import { SeatsModule } from '../seats/seats.module';
import { TicketsModule } from '../tickets/tickets.module';

@Module({})
export class EventsModule {
  static forRoot(): DynamicModule {
    return {
      module: EventsModule,
      imports: [
        TypeOrmModule.forFeature([Event]),
        VenuesModule.forRoot(),
        SeatsModule.forRoot(),
        TicketsModule.forRoot(),
      ],
      controllers: [EventsController],
      providers: [EventsService],
      exports: [EventsService],
      global: false,
    };
  }
}
