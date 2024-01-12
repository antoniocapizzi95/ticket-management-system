import { NotificationRepository } from "../repository/notification/notification.repository";
import { Purchase } from "../models/purchase.model";
import { Event } from "../models/event.model";
import { PurchasesRepository } from "../repository/purchases/purchases.repository";
import { UsersRepository } from "../repository/users/users.repository";
import { EventsRepository } from "src/repository/events/events.repository";
import { Mutex } from 'async-mutex';

const MAX_TICKETS_PER_EVENT = 3;
const mutex = new Mutex();

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
    // Mutex acquisition to make the purchase transactional
    const release = await mutex.acquire();

    try {
      const user = await this.userRepository.getUser(purchaseData.userId);

      if (!user) {
        throw new Error('selected user doesn\'t exists');
      }

      const involvedEvents: Event[] = [];
      for (const eventToPurchase of purchaseData.eventsToPurchase) {
        const event = await this.eventsRepository.getEventById(eventToPurchase.eventId);

        if (!event) {
          throw new Error(`Event with id ${event.id} doesn\'t exists`);
        }

        if (eventToPurchase.ticketsNumber > MAX_TICKETS_PER_EVENT) {
          throw new Error(`Impossible to purchase more than ${MAX_TICKETS_PER_EVENT} tickets per event`);
        }

        if (eventToPurchase.ticketsNumber > event.availableTickets) {
          throw new Error(`Insufficient tickets for the event ${event.name} with id ${event.id}`);
        }

        involvedEvents.push(event);
      }

      if (!this.isPaidPriceCorrect(purchaseData, involvedEvents)) {
        throw new Error('The paid price is incorrect');
      }

      await this.decreaseAvailableTickets(purchaseData, involvedEvents);

      // Release mutex at the end of the operation
      release();

      purchaseData.purchaseDateTime = new Date()
      const newPurchaseId = await this.purchasesRepository.addPurchase(purchaseData);

      await this.notificationRepository.sendNotification(user.username, `The purchase with number ${newPurchaseId} was successfully completed`)

    } catch (error) {
      // Release mutex in case of error
      release();
  
      throw error;
    }
    
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

  protected isPaidPriceCorrect (purchase: Purchase, involvedEvents: Event[]): boolean {
    const paidPrice = purchase.paidPrice;
    let correctSum = 0;
    for (const purchasedEvent of purchase.eventsToPurchase) {
      const event = involvedEvents.find((evt) => evt.id === purchasedEvent.eventId);
      if (event) {
        const correctPrice = event.ticketPrice * purchasedEvent.ticketsNumber;
        correctSum += correctPrice;
      }
    }
    return correctSum === paidPrice;
  }

}