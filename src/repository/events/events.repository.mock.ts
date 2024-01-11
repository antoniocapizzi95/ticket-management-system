import { Event } from "../../models/event.model";
import { EventsRepository } from "./events.repository";

export class EventsRepositoryMock implements EventsRepository {
    private eventsInMemory: Event[];

    constructor () {
        this.eventsInMemory = [
            { id: 1, name: 'event1', availableTickets: 200, ticketPrice: 50, eventDate: new Date('2024-06-01'), location: 'Milan' },
            { id: 2, name: 'event2', availableTickets: 100, ticketPrice: 40, eventDate: new Date('2024-07-12'), location: 'Turin' }
        ];
    }
    
    async getEventsList (): Promise<Event[]> {
        return this.eventsInMemory;
    }

    async getEventById (id: Number): Promise<Event> {
        for (const event of this.eventsInMemory) {
            if (id === event.id) {
                return event;
            }
        }
        return null;
    }

    async update (eventId: Number, newEvent: Event) {
        this.eventsInMemory = this.eventsInMemory.map(event => {
            if (event.id === eventId) {
              return newEvent;
            }
            return event;
        });
    }

}