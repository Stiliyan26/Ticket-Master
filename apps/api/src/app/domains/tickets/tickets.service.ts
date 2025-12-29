import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { Event } from '../events/entities/event.entity';
import { Seat } from '../seats/entities/seat.entity';
import { Transactional } from '../../common/decorators/transactional';
import {
  createEntityMessageOverrides,
  DB_OPERATIONS,
} from '../../common/utils/database-error.util';
import { Booking } from '../bookings/entities/booking.entity';
import { EventsService } from '../events/events.service';

export interface TicketQueryCountResult {
  available: string;
  total: string;
}

export interface TicketCountResult {
  available: number;
  total: number;
}

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);
  private readonly CHUNK_SIZE = 500;
  private readonly ALIAS = 'ticket';

  constructor(
    @InjectRepository(Ticket)
    public readonly ticketRepository: Repository<Ticket>,
    private readonly eventService: EventsService
  ) {}

  @Transactional<TicketsService>({
    repoKey: 'ticketRepository',
    errorContext: TicketsService.name,
    messageOverrides: createEntityMessageOverrides(
      Ticket.name,
      DB_OPERATIONS.CREATE
    ),
  })
  async createTicketsForEvent(event: Event, seats: Seat[]): Promise<void> {
    this.logger.log(
      `Generating ${seats.length} tickets for event: ${event.name}`
    );

    for (let i = 0; i < seats.length; i += this.CHUNK_SIZE) {
      const seatsChunk = seats.slice(i, i + this.CHUNK_SIZE);

      const tickets = seatsChunk.map((seat) => {
        return this.ticketRepository.create({
          event,
          seat,
          price: event.basePrice,
          status: TicketStatus.AVAILABLE,
        });
      });

      // Use await to ensure tickets are saved before the next chunk starts
      await this.ticketRepository.save(tickets);

      this.logger.debug(
        `Saved chunk of ${tickets.length} tickets (${i + tickets.length}/${
          seats.length
        })`
      );
    }
  }

  async findByEvent(eventId: string): Promise<Ticket[]> {
    return this.ticketRepository.find({
      where: { event: { id: eventId } },
      relations: {
        seat: true,
        event: true,
        booking: true,
      },
    });
  }

  async removeTicketsByEvent(eventId: string): Promise<void> {
    await this.ticketRepository.delete({ event: { id: eventId } });
  }

  async updatePricesByEvent(eventId: string, newPrice: number): Promise<void> {
    await this.ticketRepository.update(
      {
        event: { id: eventId },
        status: TicketStatus.AVAILABLE,
      },
      {
        price: newPrice,
      }
    );
  }

  async hasSoldTickets(eventId: string): Promise<boolean> {
    const soldTicketsCnt = await this.ticketRepository.count({
      where: {
        event: { id: eventId },
        status: TicketStatus.SOLD,
      },
    });

    return soldTicketsCnt > 0;
  }

  @Transactional<TicketsService>({
    repoKey: 'ticketRepository',
    errorContext: TicketsService.name,
    messageOverrides: createEntityMessageOverrides(
      Ticket.name,
      DB_OPERATIONS.READ
    ),
  })
  async findAllTickets(
    ids: string[],
    lock?: { mode: 'pessimistic_write' | 'pessimistic_read' }
  ): Promise<Ticket[]> {
    return this.ticketRepository.find({
      where: {
        id: In(ids),
      },
      lock,
    });
  }

  @Transactional<TicketsService>({
    repoKey: 'ticketRepository',
    errorContext: TicketsService.name,
    messageOverrides: createEntityMessageOverrides(
      Ticket.name,
      DB_OPERATIONS.UPDATE
    ),
  })
  async holdTickets(ticketIds: string[]): Promise<Ticket[]> {
    const tickets = await this.findAllTickets(ticketIds, {
      mode: 'pessimistic_write',
    });

    if (tickets.length !== ticketIds.length) {
      throw new NotFoundException('Some tickets were not found');
    }

    const unavailableTickets = tickets.filter(
      (t) => t.status !== TicketStatus.AVAILABLE
    );

    if (unavailableTickets.length > 0) {
      const unavailableIds = unavailableTickets.map((t) => t.id).join(', ');

      throw new ConflictException(
        `Some tickets are not available: [${unavailableIds}].`
      );
    }

    tickets.forEach((t) => {
      t.status = TicketStatus.HELD;
      t.heldAt = new Date();
    });

    const heldTickets = await this.ticketRepository.save(tickets);

    return heldTickets;
  }

  @Transactional<TicketsService>({
    repoKey: 'ticketRepository',
    errorContext: TicketsService.name,
    messageOverrides: createEntityMessageOverrides(
      Ticket.name,
      DB_OPERATIONS.UPDATE
    ),
  })
  async releaseTickets(ticketIds: string[]): Promise<void> {
    const tickets = await this.findAllTickets(ticketIds, {
      mode: 'pessimistic_write',
    });

    const heldTickets = tickets.filter(
      (t) => t.status === TicketStatus.HELD || t.status === TicketStatus.SOLD
    );

    heldTickets.forEach((t) => {
      t.status = TicketStatus.AVAILABLE;
      t.heldAt = null;
      t.booking = undefined;
    });

    await this.ticketRepository.save(heldTickets);
  }

  @Transactional<TicketsService>({
    repoKey: 'ticketRepository',
    errorContext: TicketsService.name,
    messageOverrides: createEntityMessageOverrides(
      Ticket.name,
      DB_OPERATIONS.UPDATE
    ),
  })
  async finalizePurchase(
    ticketIds: string[],
    booking: Booking
  ): Promise<Ticket[]> {
    const tickets = await this.findAllTickets(ticketIds, {
      mode: 'pessimistic_write',
    });

    if (tickets.length !== ticketIds.length) {
      throw new NotFoundException('Some tickets were not found');
    }

    const hasNotHeldTicket = tickets.some(
      (t) => t.status !== TicketStatus.HELD
    );

    if (hasNotHeldTicket) {
      throw new ConflictException('Tickets must be held before purchase');
    }

    tickets.forEach((t) => {
      t.status = TicketStatus.SOLD;
      t.booking = booking;
      t.heldAt = null;
    });

    const finalizedTickets = await this.ticketRepository.save(tickets);

    return finalizedTickets;
  }

  async countAvailable(eventId: string): Promise<TicketCountResult> {
    const statusProp: keyof Ticket = 'status';

    const result = await this.ticketRepository
      .createQueryBuilder(this.ALIAS)
      .select('COUNT(*)', 'total')
      .addSelect(
        `COUNT(CASE WHEN ${this.ALIAS}.${statusProp} = :status THEN 1 END)`,
        'available'
      )
      .where(`${this.ALIAS}.eventId = :eventId`, { eventId })
      .setParameter('status', TicketStatus.AVAILABLE)
      .getRawOne<TicketQueryCountResult>();

    if (!result || result.total === '0') {
      const eventExists = await this.eventService.exists(eventId);

      if (!eventExists) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }
    }

    return {
      available: Number(result?.available ?? 0),
      total: Number(result?.total ?? 0),
    };
  }
}
