import { EventsRepositoryMock } from "../repository/events/events.repository.mock";
import { EventsService } from "./events.service";

describe('EventsService', () => {
  let eventsRepositoryMock: EventsRepositoryMock;
  let eventsService: EventsService;

  beforeEach(() => {
    eventsRepositoryMock = new EventsRepositoryMock();
    eventsService = new EventsService(eventsRepositoryMock);
  });

  test('getEventsList returns events from repository', async () => {
    const eventsList = await eventsService.getEventsList();
    
    expect(eventsList).toEqual(await eventsRepositoryMock.getEventsList());
  });
});