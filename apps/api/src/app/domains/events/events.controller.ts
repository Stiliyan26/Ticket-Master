import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  ParseUUIDPipe,
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
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PaginatedResponse } from '../../common/utils/pagination.util';
import { Event } from './entities/event.entity';
import { Serialize } from '../../common/interceptors/serialize.interceptor';
import { EventResultDto } from './dto/event-result.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new event' })
  @ApiCreatedResponse({
    description: 'The event has been successfully created.',
    type: EventResultDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @Serialize(EventResultDto)
  create(@Body() createEventDto: CreateEventDto): Promise<Event> {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events with pagination' })
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
    description: 'Return a paginated list of events.',
  })
  @Serialize(EventResultDto)
  findAll(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number
  ): Promise<PaginatedResponse<Event>> {
    return this.eventsService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an event by id' })
  @ApiOkResponse({
    description: 'Return the event found by id.',
    type: EventResultDto,
  })
  @ApiNotFoundResponse({ description: 'Event not found.' })
  @Serialize(EventResultDto)
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<Event> {
    return this.eventsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event' })
  @ApiOkResponse({
    description: 'The event has been successfully updated.',
    type: EventResultDto,
  })
  @ApiNotFoundResponse({ description: 'Event not found.' })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @Serialize(EventResultDto)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto
  ): Promise<Event> {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an event' })
  @ApiNoContentResponse({
    description: 'The event has been successfully deleted.',
  })
  @ApiNotFoundResponse({ description: 'Event not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.eventsService.remove(id);
  }
}
