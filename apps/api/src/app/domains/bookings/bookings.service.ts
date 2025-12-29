import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { TicketsService } from '../tickets/tickets.service';
import {
  createEntityMessageOverrides,
  DB_OPERATIONS,
} from '../../common/utils/database-error.util';
import { Transactional } from '../../common/decorators/transactional';
import { TicketStatus } from '../tickets/entities/ticket.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    public readonly bookingRepository: Repository<Booking>,
    private readonly ticketService: TicketsService
  ) {}

  @Transactional<BookingsService>({
    repoKey: 'bookingRepository',
    errorContext: BookingsService.name,
    messageOverrides: createEntityMessageOverrides(
      Booking.name,
      DB_OPERATIONS.CREATE
    ),
  })
  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { userId, ticketIds } = createBookingDto;

    const heldTickets = await this.ticketService.holdTickets(ticketIds);

    const totalPrice = heldTickets.reduce(
      (total, ticket) => total + Number(ticket.price),
      0
    );

    const booking = this.bookingRepository.create({
      userId,
      totalPrice,
      status: BookingStatus.CONFIRMED,
    });

    const savedBooking = await this.bookingRepository.save(booking);

    const finalizedTickets = await this.ticketService.finalizePurchase(
      ticketIds,
      savedBooking
    );

    return {
      ...savedBooking,
      tickets: finalizedTickets,
    } satisfies Booking;
  }

  async findById(id: string): Promise<Booking> {
    return this.findBookingByIdInternal(id, {
      tickets: {
        seat: true,
        event: true,
      },
    });
  }

  private async findBookingByIdInternal(
    id: string,
    relations?: FindOptionsRelations<Booking>
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations,
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID: ${id} not found!`);
    }

    return booking;
  }

  @Transactional<BookingsService>({
    repoKey: 'bookingRepository',
    errorContext: BookingsService.name,
    messageOverrides: createEntityMessageOverrides(
      Booking.name,
      DB_OPERATIONS.UPDATE
    ),
  })
  async cancel(id: string): Promise<void> {
    const booking = await this.findBookingByIdInternal(id, { tickets: true });

    if (booking.status === BookingStatus.CANCELLED) {
      throw new ConflictException('Booking already cancelled');
    }

    const heldTickets = booking.tickets
      .filter((t) => t.status !== TicketStatus.AVAILABLE)
      .map((t) => t.id);

    await this.ticketService.releaseTickets(heldTickets);

    booking.status = BookingStatus.CANCELLED;

    await this.bookingRepository.save(booking);
  }
}
