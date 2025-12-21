import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { validate } from './config/env.validation';
import { VenuesModule } from './domains/venues/venues.module';
import { SeatsModule } from './domains/seats/seats.module';
import { EventsModule } from './domains/events/events.module';
import { BookingsModule } from './domains/bookings/bookings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    DatabaseModule,
    SeatsModule.forRoot(),
    VenuesModule.forRoot(),
    EventsModule.forRoot(),
    BookingsModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
