import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';

import { SeatsService } from './seats.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { Seat } from './entities/seat.entity';
import { PaginatedResponse } from '../../common/utils/pagination.util';

@Controller('seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Post()
  async create(
    @Body() createSeatDtos: CreateSeatDto | CreateSeatDto[]
  ): Promise<Seat[]> {
    const dtos = Array.isArray(createSeatDtos)
      ? createSeatDtos
      : [createSeatDtos];

    return this.seatsService.create(dtos);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number
  ): Promise<PaginatedResponse<Seat>> {
    return this.seatsService.findAll(page, limit);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Seat> {
    return this.seatsService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSeatDto: UpdateSeatDto
  ): Promise<Seat> {
    return this.seatsService.update(id, updateSeatDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.seatsService.remove(id);
  }
}
