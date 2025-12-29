import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResultDto } from './dto/booking-result.dto';
import { Booking } from './entities/booking.entity';
import { Serialize } from '../../common/interceptors/serialize.interceptor';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiCreatedResponse({
    description: 'The booking has been successfully created.',
    type: BookingResultDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or tickets unavailable.',
  })
  @Serialize(BookingResultDto)
  create(@Body() createBookingDto: CreateBookingDto): Promise<Booking> {
    return this.bookingsService.create(createBookingDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by id' })
  @ApiOkResponse({
    description: 'Return the booking found by id.',
    type: BookingResultDto,
  })
  @ApiNotFoundResponse({ description: 'Booking not found.' })
  @Serialize(BookingResultDto)
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<Booking> {
    return this.bookingsService.findById(id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiOkResponse({
    description: 'The booking has been successfully cancelled.',
  })
  @ApiNotFoundResponse({ description: 'Booking not found.' })
  cancel(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.bookingsService.cancel(id);
  }
}
