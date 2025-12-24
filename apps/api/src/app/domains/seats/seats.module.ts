import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from './entities/seat.entity';
import { SeatsController } from './seats.controller';
import { SeatsService } from './seats.service';
import { VenuesModule } from '../venues/venues.module';

@Module({})
export class SeatsModule {
  static forRoot(): DynamicModule {
    return {
      module: SeatsModule,
      imports: [TypeOrmModule.forFeature([Seat]), VenuesModule.forRoot()],
      controllers: [SeatsController],
      providers: [SeatsService],
      exports: [SeatsService],
      global: false,
    };
  }
}
