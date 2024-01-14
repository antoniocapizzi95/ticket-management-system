import { PurchasesService } from './purchases.service';
import { EventsRepositoryMock } from '../repository/events/events.repository.mock';
import { NotificationRepositoryEmail } from '../repository/notification/notification.repository.email';
import { PurchasesRepositoryMock } from '../repository/purchases/purchases.repository.mock';
import { UsersRepositoryMock } from '../repository/users/users.repository.mock';

const MAX_TICKETS_PER_EVENT = 3;

describe('PurchasesService', () => {
  let purchasesService: PurchasesService;

  // Mocked repositories
  const eventsRepositoryMock = new EventsRepositoryMock();
  const notificationRepositoryMock = new NotificationRepositoryEmail();
  const purchasesRepositoryMock = new PurchasesRepositoryMock();
  const usersRepositoryMock = new UsersRepositoryMock();

  beforeEach(() => {
    purchasesService = new PurchasesService(
      purchasesRepositoryMock,
      usersRepositoryMock,
      eventsRepositoryMock,
      notificationRepositoryMock,
      MAX_TICKETS_PER_EVENT
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('purchase method completes successfully', async () => {
    const purchaseData = {
      userId: 1,
      eventsToPurchase: [{ eventId: 1, ticketsNumber: 2 }, { eventId: 2, ticketsNumber: 3 }],
      paidPrice: 220,
      id: undefined,
      purchaseDateTime: undefined
    };

    await expect(purchasesService.purchase(purchaseData)).resolves.not.toThrow();
  });

  test('purchase method throws PurchaseError for non-existing user', async () => {
    const purchaseData = {
      userId: 999, // Non-existing user
      eventsToPurchase: [{ eventId: 1, ticketsNumber: 2 }],
      paidPrice: 100,
      id: undefined,
      purchaseDateTime: undefined
    };

    await expect(purchasesService.purchase(purchaseData)).rejects.toThrow('Selected user does not exist');
  });

  test('purchase method throws PurchaseError duplicated event to purchase', async () => {
    const purchaseData = {
        userId: 2,
        eventsToPurchase: [{ eventId: 1, ticketsNumber: 1 }, { eventId: 1, ticketsNumber: 1 }], // Duplicated event to purchase
        paidPrice: 100,
        id: undefined,
        purchaseDateTime: undefined
      };

    await expect(purchasesService.purchase(purchaseData)).rejects.toThrow('The events to purchase cannot be duplicated');
  });

  test('purchase method throws PurchaseError for too many tickets per event', async () => {
    const purchaseData = {
      userId: 2,
      eventsToPurchase: [{ eventId: 1, ticketsNumber: 4 }], // More than 3 tickets per event
      paidPrice: 100,
      id: undefined,
      purchaseDateTime: undefined
    };

    await expect(purchasesService.purchase(purchaseData)).rejects.toThrow();
  });

  test('purchase method throws PurchaseError for wrong paid price', async () => {
    const purchaseData = {
        userId: 2,
        eventsToPurchase: [{ eventId: 1, ticketsNumber: 2 }, { eventId: 2, ticketsNumber: 3 }],
        paidPrice: 100, // Wrong price
        id: undefined,
        purchaseDateTime: undefined
      };

    await expect(purchasesService.purchase(purchaseData)).rejects.toThrow('The paid price is incorrect');
  });

  test('purchase method throws PurchaseError for for event already passed', async () => {
    const purchaseData = {
        userId: 2,
        eventsToPurchase: [{ eventId: 3, ticketsNumber: 2 }], // Old event
        paidPrice: 60, 
        id: undefined,
        purchaseDateTime: undefined
      };

    await expect(purchasesService.purchase(purchaseData)).rejects.toThrow();
  });

  test('getByUser method returns purchases for existing user', async () => {
    const userId = '1';

    await expect(purchasesService.getByUser(userId)).resolves.not.toThrow();
  });

  test('getByUser method throws PurchaseError for non-existing user', async () => {
    const userId = '999'; // Non-existing user

    await expect(purchasesService.getByUser(userId)).rejects.toThrow('Selected user does not exist');
  });

});