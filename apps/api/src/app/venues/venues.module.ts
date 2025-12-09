import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from './entities/venue.entity';
import { VenuesController } from './venues.controller';
import { VenuesService } from './venues.service';

@Module({})
export class VenuesModule {
  static forRoot(): DynamicModule {
    return {
      module: VenuesModule,
      imports: [TypeOrmModule.forFeature([Venue])],
      controllers: [VenuesController],
      providers: [VenuesService],
      exports: [VenuesService],
      global: false,
    };
  }
}
