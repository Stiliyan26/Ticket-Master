import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking } from './entities/booking.entity';
import { Ticket } from './entities/ticket.entity';

@Module({})
export class BookingsModule {
  static forRoot(): DynamicModule {
    return {
      module: BookingsModule,
      imports: [TypeOrmModule.forFeature([Booking, Ticket])],
      controllers: [BookingsController],
      providers: [BookingsService],
      exports: [BookingsService],
      global: false,
    };
  }
}
