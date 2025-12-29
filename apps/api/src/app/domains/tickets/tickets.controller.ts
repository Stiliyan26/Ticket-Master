import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { TicketCountResult, TicketsService } from './tickets.service';
import { TicketResultDto } from './dto/ticket-result.dto';
import { Serialize } from '../../common/interceptors/serialize.interceptor';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('/event/:eventId')
  @ApiOperation({ summary: 'Get all tickets for a specific event' })
  @ApiOkResponse({
    description: 'Return a list of tickets for the given event.',
    type: [TicketResultDto],
  })
  @ApiNotFoundResponse({ description: 'Event not found.' })
  @Serialize(TicketResultDto)
  async findByEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string
  ): Promise<TicketResultDto[]> {
    return this.ticketsService.findByEvent(eventId);
  }

  @Get('/event/:eventId/available')
  @ApiOperation({ summary: 'Get available ticket count for event' })
  @ApiOkResponse({
    description: 'Return the count of available tickets.',
  })
  @ApiNotFoundResponse({ description: 'Event not found.' })
  async getAvailability(
    @Param('eventId', ParseUUIDPipe) eventId: string
  ): Promise<TicketCountResult> {
    return this.ticketsService.countAvailable(eventId);
  }
}
