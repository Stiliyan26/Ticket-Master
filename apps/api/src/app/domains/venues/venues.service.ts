import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Venue } from './entities/venue.entity';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { TableName } from '../../common/enums/table-name.enum';
import { Transactional } from '../../common/decorators/transactional';
import {
  createEntityMessageOverrides,
  DB_OPERATIONS,
} from '../../common/utils/database-error.util';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    public readonly venueRepository: Repository<Venue>
  ) {}

  async create(createVenueDto: CreateVenueDto): Promise<Venue> {
    const venue = this.venueRepository.create(createVenueDto);
    return this.venueRepository.save(venue);
  }

  async findAll(): Promise<Venue[]> {
    return this.venueRepository.find({
      relations: {
        seats: true,
        events: true,
      },
    });
  }

  async findById(id: string): Promise<Venue> {
    const venue = await this.venueRepository.findOne({
      where: { id },
      relations: {
        seats: true,
        events: true,
      },
    });

    if (!venue) {
      throw new NotFoundException(`Venue with ID "${id}" not found`);
    }

    return venue;
  }

  async update(id: string, updateVenueDto: UpdateVenueDto): Promise<Venue> {
    const result = await this.venueRepository.update({ id }, updateVenueDto);

    if (result.affected === 0) {
      throw new NotFoundException(`Venue with ID "${id}" not found`);
    }

    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const venue = await this.venueRepository.findOne({
      where: { id },
    });

    if (!venue) {
      throw new NotFoundException(`Venue with ID "${id}" not found`);
    }

    await this.venueRepository.remove(venue);
  }

  @Transactional<VenuesService>({
    repoKey: 'venueRepository',
    errorContext: VenuesService.name,
    messageOverrides: createEntityMessageOverrides(
      Venue.name,
      DB_OPERATIONS.READ
    ),
  })
  async findByIdsWithLock(ids: string[]): Promise<Venue[]> {
    return this.venueRepository.find({
      where: { id: In(ids) },
      relations: {
        seats: true,
        events: true,
      },
      lock: { mode: 'pessimistic_read', tables: [TableName.VENUES] },
    });
  }
}
