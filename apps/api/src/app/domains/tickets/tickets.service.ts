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

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);
  private readonly CHUNK_SIZE = 500;

  constructor(
    @InjectRepository(Ticket)
    public readonly ticketRepository: Repository<Ticket>
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
      relations: { seat: true },
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
  ) {
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

    return this.ticketRepository.save(tickets);
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

    const heldTickets = tickets.filter((t) => t.status === TicketStatus.HELD);

    heldTickets.forEach((t) => {
      t.status = TicketStatus.AVAILABLE;
      t.heldAt = null;
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
  async finalizePurchase(ticketIds: string[]): Promise<Ticket[]> {
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
      t.heldAt = null;
    });

    return this.ticketRepository.save(tickets);
  }
}
