import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking } from './entities/booking.entity';
import { TicketsModule } from '../tickets/tickets.module';

@Module({})
export class BookingsModule {
  static forRoot(): DynamicModule {
    return {
      module: BookingsModule,
      imports: [TypeOrmModule.forFeature([Booking]), TicketsModule.forRoot()],
      controllers: [BookingsController],
      providers: [BookingsService],
      exports: [BookingsService],
      global: false,
    };
  }
}
