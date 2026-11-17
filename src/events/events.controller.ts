import { Controller, Get, Post, Body } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsservice: EventsService) {}

  @Post()
  create(@Body() createeventDto: unknown) {
    return this.eventsservice.create(createeventDto);
  }

  @Get()
  findAll() {
    return this.eventsservice.findAll();
  }
}
