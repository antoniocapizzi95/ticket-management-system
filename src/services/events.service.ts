import { EventsRepository } from "../repository/events/events.repository";
import { Event } from "../models/event.model";

export class EventsService {
  // using interface types as repository
  private readonly eventsRepository: EventsRepository;

  constructor(
    eventsRepository: EventsRepository
  ) {
    this.eventsRepository = eventsRepository;
  }

  async getEventsList(): Promise<Event[]> {
    return this.eventsRepository.getEventsList()
  }
}