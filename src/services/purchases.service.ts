import { NotificationRepository } from "../repository/notification/notification.repository";
import { Purchase, EventToPurchase } from "../models/purchase.model";
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

  // This is the method that performs the purchase transaction
  async purchase(purchaseData: Purchase): Promise<void> {
    // Mutex acquisition to make the purchase transactional
    const release = await mutex.acquire();
  
    try {
      // Get the user who is making the purchase and check if exist
      const user = await this.userRepository.getUser(purchaseData.userId);
  
      if (!user) {
        throw new PurchaseError('Selected user does not exist');
      }

      // Check if there are some duplicated events in the purchase request
      if (this.checkDuplicatedEvents(purchaseData.eventsToPurchase)) {
        throw new PurchaseError('The events to purchase cannot be duplicated');
      }

      // Validate the purchase (the event exists? there are enough tickets for the seletected event?... etc.)
      // If there are a non-valid element in the request, this fuction throw an error and the entire transaction fails
      const involvedEvents: Event[] = await this.checkPurchaseValidity(purchaseData);

      await this.decreaseAvailableTickets(purchaseData.eventsToPurchase, involvedEvents);
  
      // Release mutex at the end of the operation
      release();

      // If the execution arrives here, it means that the request was correct
      
      // Setting the purchase date and time
      purchaseData.purchaseDateTime = new Date()
      // Saving the transaction data
      const newPurchaseId = await this.purchasesRepository.addPurchase(purchaseData);
      
      // Sending notification to user (it's simulated)
      await this.notificationRepository.sendNotification(user.username, `The purchase number ${newPurchaseId} was successfully completed`);
  
    } catch (error) {
      // Release mutex in case of error
      release();
  
      throw error;
    }
  }

  // This is the method that retrieve purchases for a certain user
  async getByUser (userId: string): Promise<Purchase[]> {
    const userIdNum = parseInt(userId, 10);
    const user = await this.userRepository.getUser(userIdNum);
    if (!user) {
      throw new PurchaseError('Selected user does not exist');
    }
    const purchases = await this.purchasesRepository.getPurchasesByUser(userIdNum);
    return purchases;
  }

  // Method responsible for decreasing the number of tickets available from a certain event
  private async decreaseAvailableTickets (eventsToPurchase: EventToPurchase[], involvedEvents: Event[]) {
    involvedEvents.forEach(async (event) => {
      const eventToPurchase = eventsToPurchase.find((evt) => evt.eventId === event.id);
      if (eventToPurchase) {
        event.availableTickets = event.availableTickets - eventToPurchase.ticketsNumber;
        await this.eventsRepository.update(event.id, event);
      }
    });
  }

  // Method to check the purchase validity, it returns the list of involved events to avoid too many repository calls to retrieve events
  private async checkPurchaseValidity (purchase: Purchase): Promise<Event[]> {
    const involvedEvents: Event[] = [];
      for (const eventToPurchase of purchase.eventsToPurchase) {
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

        if (this.isEventDatePassed(event.eventDate)) {
          throw new PurchaseError(`The event ${event.name} with id ${event.id} has already taken place`);
        }
  
        involvedEvents.push(event);
      }

      if (!this.isPaidPriceCorrect(purchase, involvedEvents)) {
        throw new PurchaseError('The paid price is incorrect');
      }
      return involvedEvents;
  } 

  // Method that checks whether the figure paid (ideally) on the front-end side is correct
  private isPaidPriceCorrect (purchase: Purchase, involvedEvents: Event[]): boolean {
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

  // Method which checks whether a duplicate 'EventToPurchase' object is added to the same request for the same event
  private checkDuplicatedEvents (eventsToPurchase: EventToPurchase[]): boolean {
    const ids = new Set();
  
    return eventsToPurchase.some(obj => {
      if (ids.has(obj.eventId)) {
        return true;
      } else {
        ids.add(obj.eventId);
        return false;
      }
    });
  }

  // Method that checks whether the event being purchased has already taken place in the past
  private isEventDatePassed(eventDate: Date): boolean {
    const currentDate = new Date();
    return eventDate < currentDate;
  }

}