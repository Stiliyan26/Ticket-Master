import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Seat } from './entities/seat.entity';
import { VenuesService } from '../venues/venues.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { SEAT_LIMITS } from './constants/seat-limits';
import { SEAT_ERROR_MESSAGES } from './constants/seat-messages';
import { Venue } from '../venues/entities/venue.entity';
import {
  paginate,
  PaginatedResponse,
} from '../../common/utils/pagination.util';
import {
  createEntityMessageOverrides,
  DB_OPERATIONS,
} from '../../common/utils/database-error.util';
import { Transactional } from '../../common/decorators/transactional';

@Injectable()
export class SeatsService {
  private readonly logger = new Logger(SeatsService.name);

  constructor(
    @InjectRepository(Seat)
    public readonly seatRepository: Repository<Seat>,
    private readonly venuesService: VenuesService
  ) {}

  @Transactional<SeatsService>({
    repoKey: 'seatRepository',
    errorContext: SeatsService.name,
    messageOverrides: createEntityMessageOverrides(
      Seat.name,
      DB_OPERATIONS.CREATE
    ),
  })
  async create(createSeatDtos: CreateSeatDto[]): Promise<Seat[]> {
    this.validateBatchSize(createSeatDtos);

    const venueIds = this.getUniqueVenueIds(createSeatDtos);

    const venuesMap = await this.getVenuesMap(venueIds);

    this.logger.log(`Creating ${createSeatDtos.length} seats in bulk`);

    const entities = this.mapSeatDtoToEntity(createSeatDtos, venuesMap);

    const savedSeats = await this.seatRepository.save(entities);

    return savedSeats;
  }

  async findAll(page: number, limit: number): Promise<PaginatedResponse<Seat>> {
    const paginatedResult = await paginate(
      this.seatRepository,
      // TODO: pass query options from the client
      {
        relations: {
          venue: true,
        },
        order: {
          venue: { name: 'ASC' },
          section: 'ASC',
          row: 'ASC',
          number: 'ASC',
        },
      },
      page,
      limit
    );

    return paginatedResult;
  }

  @Transactional<SeatsService>({
    repoKey: 'seatRepository',
    errorContext: SeatsService.name,
    messageOverrides: createEntityMessageOverrides(
      Seat.name,
      DB_OPERATIONS.READ
    ),
  })
  async findById(id: string): Promise<Seat> {
    const seat = await this.seatRepository.findOne({
      where: { id },
      relations: {
        venue: true,
      },
    });

    if (!seat) {
      throw new NotFoundException(`Seat with ID "${id}" not found`);
    }

    return seat;
  }

  @Transactional<SeatsService>({
    repoKey: 'seatRepository',
    errorContext: SeatsService.name,
    messageOverrides: createEntityMessageOverrides(
      Seat.name,
      DB_OPERATIONS.UPDATE
    ),
  })
  async update(id: string, updateSeatDto: UpdateSeatDto): Promise<Seat> {
    const seat = await this.seatRepository.findOne({
      where: { id },
      relations: { venue: true },
    });

    if (!seat) {
      throw new NotFoundException(`Seat with ID "${id}" not found`);
    }

    if (updateSeatDto.venueId && updateSeatDto.venueId !== seat.venue.id) {
      const venue = await this.venuesService.findById(updateSeatDto.venueId);

      seat.venue = venue;
    }

    this.seatRepository.merge(seat, updateSeatDto);

    const updatedSeat = await this.seatRepository.save(seat);

    return updatedSeat;
  }

  @Transactional<SeatsService>({
    repoKey: 'seatRepository',
    errorContext: SeatsService.name,
    messageOverrides: createEntityMessageOverrides(
      Seat.name,
      DB_OPERATIONS.REMOVE
    ),
  })
  async remove(id: string): Promise<void> {
    const seat = await this.findById(id);
    await this.seatRepository.remove(seat);
  }

  // TODO: CHECK IF I NEED TO REMOVE it
  @Transactional<SeatsService>({
    repoKey: 'seatRepository',
    errorContext: SeatsService.name,
    messageOverrides: createEntityMessageOverrides(
      Seat.name,
      DB_OPERATIONS.READ
    ),
  })
  async findAllByVenue(venueId: string): Promise<Seat[]> {
    return this.seatRepository.find({
      where: { venue: { id: venueId } },
      relations: { venue: true },
    });
  }

  // HELPER METHODS

  private validateBatchSize(dtos: CreateSeatDto[]): void {
    if (dtos.length === 0) {
      throw new BadRequestException(SEAT_ERROR_MESSAGES.EMPTY_BATCH);
    }

    if (dtos.length > SEAT_LIMITS.MAX_BATCH_SIZE) {
      throw new BadRequestException(
        SEAT_ERROR_MESSAGES.BATCH_TOO_LARGE(SEAT_LIMITS.MAX_BATCH_SIZE)
      );
    }
  }

  private getUniqueVenueIds(dtos: CreateSeatDto[]): string[] {
    const set = dtos.reduce((acc, dto) => {
      acc.add(dto.venueId);

      return acc;
    }, new Set<string>());

    return [...set];
  }

  private async getVenuesMap(venueIds: string[]): Promise<Map<string, Venue>> {
    const venuesFromDb = await this.venuesService.findByIdsWithLock(venueIds);

    const venuesMap = venuesFromDb.reduce((map, venue) => {
      map.set(venue.id, venue);

      return map;
    }, new Map<string, Venue>());

    const missingIds = venueIds.filter((id) => !venuesMap.has(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(
        SEAT_ERROR_MESSAGES.VENUE_NOT_FOUND(missingIds.join(', '))
      );
    }

    return venuesMap;
  }

  private mapSeatDtoToEntity(
    dtos: CreateSeatDto[],
    venuesMap: Map<string, Venue>
  ): Seat[] {
    return dtos.map((dto) => {
      const { venueId, ...seatDto } = dto;

      const venue = venuesMap.get(venueId);

      if (!venue) {
        throw new NotFoundException(
          SEAT_ERROR_MESSAGES.VENUE_NOT_FOUND(venueId)
        );
      }

      return this.seatRepository.create({
        ...seatDto,
        venue,
      });
    });
  }
}
