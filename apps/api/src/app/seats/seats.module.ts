import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from './entities/seat.entity';
import { SeatsController } from './seats.controller';
import { SeatsService } from './seats.service';

@Module({})
export class SeatsModule {
  static forRoot(): DynamicModule {
    return {
      module: SeatsModule,
      imports: [
        TypeOrmModule.forFeature([Seat]),
        // Base entity, no dependencies
      ],
      controllers: [SeatsController],
      providers: [SeatsService],
      exports: [SeatsService],
      global: false,
    };
  }
}
