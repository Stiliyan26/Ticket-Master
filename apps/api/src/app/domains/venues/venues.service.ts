import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Venue } from './entities/venue.entity';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { Transactional } from '../../common/decorators/transactional';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private readonly venueRepository: Repository<Venue>
  ) {}

  create(createVenueDto: CreateVenueDto): Promise<Venue> {
    const venue = this.venueRepository.create(createVenueDto);

    return this.venueRepository.save(venue);
  }

  findAll(): Promise<Venue[]> {
    return this.venueRepository.find();
  }

  async findOne(id: string): Promise<Venue> {
    const venue = await this.venueRepository.findOne({ where: { id } });

    if (!venue) {
      throw new NotFoundException(`Venue with ID "${id}" not found`);
    }

    return venue;
  }

  async update(id: string, updateVenueDto: UpdateVenueDto): Promise<Venue> {
    const result = await this.venueRepository.update(id, updateVenueDto);

    if (result.affected === 0) {
      throw new NotFoundException(`Venue with ID "${id}" not found`);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const venue = await this.findOne(id);

    await this.venueRepository.remove(venue);
  }

  @Transactional({
    errorContext: 'VenuesService.findByIds',
  })
  findByIds(ids: string[]): Promise<Venue[]> {
    return this.venueRepository.find({
      where: { id: In(ids) },
    });
  }
}
