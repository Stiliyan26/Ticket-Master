import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking } from './entities/booking.entity';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiCreatedResponse({
    description: 'The booking has been successfully created.',
    type: Booking,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or tickets unavailable.',
  })
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiOkResponse({
    description: 'Return all bookings.',
    type: [Booking],
  })
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by id' })
  @ApiOkResponse({
    description: 'Return the booking found by id.',
    type: Booking,
  })
  @ApiNotFoundResponse({ description: 'Booking not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a booking' })
  @ApiOkResponse({
    description: 'The booking has been successfully updated.',
    type: Booking,
  })
  @ApiNotFoundResponse({ description: 'Booking not found.' })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookingDto: UpdateBookingDto
  ) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a booking' })
  @ApiNoContentResponse({
    description: 'The booking has been successfully deleted.',
  })
  @ApiNotFoundResponse({ description: 'Booking not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.remove(id);
  }
}
