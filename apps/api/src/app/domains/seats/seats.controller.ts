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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { SeatsService } from './seats.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { SeatResultDto } from './dto/seat-result.dto';
import { Seat } from './entities/seat.entity';
import { PaginatedResponse } from '../../common/utils/pagination.util';
import { Serialize } from '../../common/interceptors/serialize.interceptor';
import { createPaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@ApiTags('seats')
@Controller('seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create one or multiple seats' })
  @ApiBody({
    type: CreateSeatDto,
    isArray: true,
    description: 'Can be a single seat object or an array of seats',
  })
  @ApiCreatedResponse({
    description: 'The seats have been successfully created.',
    type: [SeatResultDto],
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @Serialize(SeatResultDto)
  async create(
    @Body() createSeatDtos: CreateSeatDto | CreateSeatDto[]
  ): Promise<Seat[]> {
    const dtos = Array.isArray(createSeatDtos)
      ? createSeatDtos
      : [createSeatDtos];

    return this.seatsService.create(dtos);
  }

  @Get()
  @ApiOperation({ summary: 'Get all seats with pagination' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiOkResponse({
    description: 'Return a paginated list of seats.',
  })
  @Serialize(createPaginatedResponseDto(SeatResultDto))
  async findAll(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number
  ): Promise<PaginatedResponse<Seat>> {
    return this.seatsService.findAll(page, limit);
  }

  @Get('/venue/:venueId')
  @ApiOperation({ summary: 'Get all seats for a specific venue' })
  @ApiOkResponse({
    description: 'Return a list of seats for the given venue.',
    type: [SeatResultDto],
  })
  @ApiNotFoundResponse({ description: 'Venue not found.' })
  @Serialize(SeatResultDto)
  async findAllByVenue(
    @Param('venueId', ParseUUIDPipe) venueId: string
  ): Promise<Seat[]> {
    return this.seatsService.findAllByVenue(venueId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a seat by id' })
  @ApiOkResponse({
    description: 'Return the seat found by id.',
    type: SeatResultDto,
  })
  @ApiNotFoundResponse({ description: 'Seat not found.' })
  @Serialize(SeatResultDto)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Seat> {
    return this.seatsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a seat' })
  @ApiOkResponse({
    description: 'The seat has been successfully updated.',
    type: SeatResultDto,
  })
  @ApiNotFoundResponse({ description: 'Seat not found.' })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @Serialize(SeatResultDto)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSeatDto: UpdateSeatDto
  ): Promise<Seat> {
    return this.seatsService.update(id, updateSeatDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a seat' })
  @ApiNoContentResponse({
    description: 'The seat has been successfully deleted.',
  })
  @ApiNotFoundResponse({ description: 'Seat not found.' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.seatsService.remove(id);
  }
}
