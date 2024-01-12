import { NotificationRepository } from "../repository/notification/notification.repository";
import { Purchase } from "../models/purchase.model";
import { Event } from "../models/event.model";
import { PurchasesRepository } from "../repository/purchases/purchases.repository";
import { UsersRepository } from "../repository/users/users.repository";
import { EventsRepository } from "../repository/events/events.repository";
import { Mutex } from 'async-mutex';
import { PurchaseError } from "../errors/purchase.error";

const mutex = new Mutex();

export class PurchasesService {
  // using interface types as repositories
  private readonly purchasesRepository: PurchasesRepository;
  private readonly userRepository: UsersRepository;
  private readonly notificationRepository: NotificationRepository;
  private readonly eventsRepository: EventsRepository;
  private readonly maxTicketsPerEvent: number;

  constructor(
    purchasesRepository: PurchasesRepository,
    userRepository: UsersRepository,
    eventsRepository: EventsRepository,
    notificationRepository: NotificationRepository,
    maxTicketsPerEvent: number
  ) {
    this.purchasesRepository = purchasesRepository;
    this.userRepository = userRepository;
    this.eventsRepository = eventsRepository;
    this.notificationRepository = notificationRepository;
    this.maxTicketsPerEvent = maxTicketsPerEvent;
  }

  async purchase(purchaseData: Purchase): Promise<void> {
    // Mutex acquisition to make the purchase transactional
    const release = await mutex.acquire();
  
    try {
      const user = await this.userRepository.getUser(purchaseData.userId);
  
      if (!user) {
        throw new PurchaseError('Selected user does not exist');
      }
  
      const involvedEvents: Event[] = [];
      for (const eventToPurchase of purchaseData.eventsToPurchase) {
        const event = await this.eventsRepository.getEventById(eventToPurchase.eventId);
  
        if (!event) {
          throw new PurchaseError(`Event with id ${event.id} does not exist`);
        }
  
        if (eventToPurchase.ticketsNumber > this.maxTicketsPerEvent) {
          throw new PurchaseError(`Impossible to purchase more than ${this.maxTicketsPerEvent} tickets per event`);
        }
  
        if (eventToPurchase.ticketsNumber > event.availableTickets) {
          throw new PurchaseError(`Insufficient tickets for the event ${event.name} with id ${event.id}`);
        }
  
        involvedEvents.push(event);
      }
  
      if (!this.isPaidPriceCorrect(purchaseData, involvedEvents)) {
        throw new PurchaseError('The paid price is incorrect');
      }
  
      await this.decreaseAvailableTickets(purchaseData, involvedEvents);
  
      // Release mutex at the end of the operation
      release();
  
      purchaseData.purchaseDateTime = new Date()
      const newPurchaseId = await this.purchasesRepository.addPurchase(purchaseData);
  
      await this.notificationRepository.sendNotification(user.username, `The purchase number ${newPurchaseId} was successfully completed`);
  
    } catch (error) {
      // Release mutex in case of error
      release();
  
      throw error;
    }
  }

  async getByUser (userId: string): Promise<Purchase[]> {
    const userIdNum = parseInt(userId, 10);
    const user = await this.userRepository.getUser(userIdNum);
    if (!user) {
      throw new PurchaseError('Selected user does not exist');
    }
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