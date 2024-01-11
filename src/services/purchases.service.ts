import { NotificationRepository } from "../repository/notification/notification.repository";
import { Purchase } from "../models/purchase.model";
import { Event } from "../models/event.model";
import { PurchasesRepository } from "../repository/purchases/purchases.repository";
import { UsersRepository } from "../repository/users/users.repository";
import { EventsRepository } from "src/repository/events/events.repository";

const MAX_TICKETS_PER_EVENT = 3;

export class PurchasesService {
  // using interface types as repositories
  private purchasesRepository: PurchasesRepository;
  private userRepository: UsersRepository;
  private notificationRepository: NotificationRepository;
  private eventsRepository: EventsRepository;

  constructor(
    purchasesRepository: PurchasesRepository,
    userRepository: UsersRepository,
    eventsRepository: EventsRepository,
    notificationRepository: NotificationRepository
  ) {
    this.purchasesRepository = purchasesRepository;
    this.userRepository = userRepository;
    this.eventsRepository = eventsRepository;
    this.notificationRepository = notificationRepository;
  }

  async purchase(purchaseData: Purchase): Promise<void> {
    const user = await this.userRepository.getUser(purchaseData.userId);

    if (!user) {
      throw new Error('selected user doesn\'t exists');
    }

    const involvedEvents: Event[] = [];
    for (const eventToPurchase of purchaseData.eventsToPurchase) {
      const event = await this.eventsRepository.getEventById(eventToPurchase.eventId);

      if (!event) {
        throw new Error(`event with id ${event.id} doesn\'t exists`);
      }

      if (eventToPurchase.ticketsNumber > MAX_TICKETS_PER_EVENT) {
        throw new Error(`impossible to purchase more than ${MAX_TICKETS_PER_EVENT} tickets per event`);
      }

      if (eventToPurchase.ticketsNumber > event.availableTickets) {
        throw new Error(`insufficient tickets for the event ${event.name} with id ${event.id}`);
      }

      involvedEvents.push(event);
    }

    // TODO: calculate the price

    await this.decreaseAvailableTickets(purchaseData, involvedEvents);

    const newPurchaseId = await this.purchasesRepository.addPurchase(purchaseData);

    await this.notificationRepository.sendNotification(user.username, `The purchase with number ${newPurchaseId} was successfully completed`)
  }

  async getByUser (userId: string): Promise<Purchase[]> {
    const userIdNum = parseInt(userId, 10);
    const purchases = await this.purchasesRepository.getPurchasesByUser(userIdNum);
    return purchases;
  }

  private async decreaseAvailableTickets (purchase: Purchase, involvedEvents: Event[]) {
    involvedEvents.forEach(async (event) => {
      const eventToPurchase = purchase.eventsToPurchase.find((evt) => evt.eventId === event.id);
      if (eventToPurchase) {
        event.availableTickets = event.availableTickets - eventToPurchase.ticketsNumber;
        await this.eventsRepository.update(event.id, event);
      }
    });
  }

}