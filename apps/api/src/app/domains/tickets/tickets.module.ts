import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { EntityCheckerModule } from '../../common/services/entity-checker.module';

@Module({})
export class TicketsModule {
  static forRoot(): DynamicModule {
    return {
      module: TicketsModule,
      imports: [
        TypeOrmModule.forFeature([Ticket]),
        EntityCheckerModule,
      ],
      controllers: [TicketsController],
      providers: [TicketsService],
      exports: [TicketsService],
      global: false,
    };
  }
}
