import express from "express";
import { EventsService } from "../services/events.service";


export class EventsController {
  private readonly eventsService: EventsService;

  constructor(eventsService: EventsService) {
    this.eventsService = eventsService;
  }

  async getEventsList (req: express.Request, res: express.Response) {
    try {
      const events = await this.eventsService.getEventsList();
      res.json({ availableEvents: events });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
