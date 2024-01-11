import { NotificationRepository } from "../repository/notification/notification.repository";
import { Purchase } from "../models/purchase.model";
import { PurchasesRepository } from "../repository/purchases/purchases.repository";

export class PurchasesService {
  // using interface types as repositories
  private purchasesRepository: PurchasesRepository;
  private notificationRepository: NotificationRepository;

  constructor(
    purchasesRepository: PurchasesRepository,
    notificationRepository: NotificationRepository
  ) {
    this.purchasesRepository = purchasesRepository;
    this.notificationRepository = notificationRepository;
  }

  async purchase(purchaseData: Purchase): Promise<void> {
    // TODO: verify if user inside puchaseData.userId exists

    for (const eventToPurchase of purchaseData.eventsToPurchase) {
      // TODO: verify if event inside eventToPurchase.eventId exists

      // TODO: verify if event inside eventToPurchase.ticketsNumber are less than or equal to available tickets in event

      // TODO: if it's all correct save purchase and decrease available tickets for the selected event

      // TODO: send notification
    }
  }

  async getByUser(userId: string): Promise<Purchase[]> {
    // TODO: return purchased object by user id
    return null;
  }
}