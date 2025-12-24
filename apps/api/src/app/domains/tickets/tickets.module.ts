import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketsService } from './tickets.service';
import { TicketController } from './tickets.controller';

@Module({})
export class TicketsModule {
  static forRoot(): DynamicModule {
    return {
      module: TicketsModule,
      imports: [TypeOrmModule.forFeature([Ticket])],
      controllers: [TicketController],
      providers: [TicketsService],
      exports: [TicketsService],
      global: false,
    };
  }
}
