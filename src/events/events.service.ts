import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class EventsService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: unknown) {
    const sender =
      dto && typeof dto === 'object' && !Array.isArray(dto) && typeof (dto as { sender?: unknown }).sender === 'string'
        ? (dto as { sender: string }).sender
        : 'email';

    return this.db.client.events.create({
      data: {
        sender,
        body: dto as object,
      },
    });
  }

  async findAll() {
    return this.db.client.events.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
