import { Event } from "../../models/event.model";

export interface EventsRepository {
  getEventsList(): Promise<Event[]>;
  getEventById(id: Number): Promise<Event>;
}