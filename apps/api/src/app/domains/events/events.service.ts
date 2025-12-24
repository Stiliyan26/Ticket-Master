import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { VenuesService } from '../venues/venues.service';
import { SeatsService } from '../seats/seats.service';
import { TicketsService } from '../tickets/tickets.service';
import { Transactional } from '../../common/decorators/transactional';
import {
  createEntityMessageOverrides,
  DB_OPERATIONS,
} from '../../common/utils/database-error.util';
import {
  paginate,
  PaginatedResponse,
} from '../../common/utils/pagination.util';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    public readonly eventRepository: Repository<Event>,
    private readonly venuesService: VenuesService,
    private readonly seatsService: SeatsService,
    private readonly ticketsService: TicketsService
  ) {}

  @Transactional<EventsService>({
    repoKey: 'eventRepository',
    errorContext: EventsService.name,
    messageOverrides: createEntityMessageOverrides(
      Event.name,
      DB_OPERATIONS.CREATE
    ),
  })
  async create(createEventDto: CreateEventDto): Promise<Event> {
    const { venueId, ...eventData } = createEventDto;

    const venue = await this.venuesService.findOne(venueId);

    const event = this.eventRepository.create({
      ...eventData,
      venue,
    });

    const savedEvent = await this.eventRepository.save(event);

    const seats = await this.seatsService.findAllByVenue(venueId);

    await this.ticketsService.createTicketsForEvent(savedEvent, seats);

    this.logger.log(
      `Event "${savedEvent.name}" created with ${seats.length} tickets`
    );
    return savedEvent;
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedResponse<Event>> {
    // TODO: Allow users to pass arguments
    return paginate(
      this.eventRepository,
      {
        relations: {
          venue: true,
        },
        order: {
          date: 'ASC',
        },
      },
      page,
      limit
    );
  }

  @Transactional<EventsService>({
    repoKey: 'eventRepository',
    errorContext: EventsService.name,
    messageOverrides: createEntityMessageOverrides(
      Event.name,
      DB_OPERATIONS.READ
    ),
  })
  async findOne(
    id: string,
    lock?: { mode: 'pessimistic_write' | 'pessimistic_read' }
  ): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: { venue: true },
      lock,
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    return event;
  }

  @Transactional<EventsService>({
    repoKey: 'eventRepository',
    errorContext: EventsService.name,
    messageOverrides: createEntityMessageOverrides(
      Event.name,
      DB_OPERATIONS.UPDATE
    ),
  })
  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const { venueId, ...updateEventData } = updateEventDto;
    const existingEvent = await this.findOne(id, { mode: 'pessimistic_write' });

    if (venueId != null && venueId !== existingEvent.venue.id) {
      const hasSold = await this.ticketsService.hasSoldTickets(id);

      if (hasSold) {
        throw new UnprocessableEntityException(
          'Cannot change venue for an event with sold tickets'
        );
      }

      const venue = await this.venuesService.findOne(venueId);

      await this.ticketsService.removeTicketsByEvent(id);

      existingEvent.venue = venue;
      const seats = await this.seatsService.findAllByVenue(venueId);
      await this.ticketsService.createTicketsForEvent(existingEvent, seats);

      this.logger.log(
        `Venue updated for event "${existingEvent.name}". Tickets re-generated for new venue.`
      );
    }

    if (
      updateEventData.basePrice != null &&
      updateEventData.basePrice !== existingEvent.basePrice
    ) {
      await this.ticketsService.updatePricesByEvent(
        id,
        updateEventData.basePrice
      );

      this.logger.log(
        `Price updated for event "${existingEvent.name}". Available tickets updated.`
      );
    }

    this.eventRepository.merge(existingEvent, updateEventData);

    return this.eventRepository.save(existingEvent);
  }

  @Transactional<EventsService>({
    repoKey: 'eventRepository',
    errorContext: EventsService.name,
    messageOverrides: createEntityMessageOverrides(
      Event.name,
      DB_OPERATIONS.REMOVE
    ),
  })
  async remove(id: string): Promise<void> {
    const event = await this.findOne(id, { mode: 'pessimistic_write' });

    const hasSold = await this.ticketsService.hasSoldTickets(id);

    if (hasSold) {
      throw new BadRequestException('Cannot remove an event with sold tickets');
    }

    await this.eventRepository.remove(event);

    this.logger.log(`Event "${event.name}" and its tickets were removed.`);
  }
}
