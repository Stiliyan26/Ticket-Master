import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';

@ApiTags('tickets')
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('/event/:eventId')
  @ApiOperation({ summary: 'Get all tickets for a specific event' })
  @ApiOkResponse({
    description: 'Return a list of tickets for the given event.',
    type: [Ticket],
  })
  @ApiNotFoundResponse({ description: 'Event not found.' })
  async findByEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string
  ): Promise<Ticket[]> {
    return this.ticketsService.findByEvent(eventId);
  }
}
