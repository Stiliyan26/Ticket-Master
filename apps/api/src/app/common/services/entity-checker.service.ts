import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../domains/events/entities/event.entity';

@Injectable()
export class EntityCheckerService {
    constructor(
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>
    ) { }

    async eventExists(eventId: string): Promise<boolean> {
        return this.eventRepository.exists({ where: { id: eventId } });
    }
}

