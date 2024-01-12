import { Express, Request, Response } from 'express';
import { PurchaseRepositoryMock } from './repository/purchases/purchases.repository.mock';
import { NotificationRepositoryEmail } from './repository/notification/notification.repository.email';
import { PurchasesService } from './services/purchases.service';
import { EventsService } from './services/events.service';
import { EventsRepositoryMock } from './repository/events/events.repository.mock';
import { PurchasesController } from './controllers/purchases.controller';
import { EventsController } from './controllers/events.controller';
import { UsersRepositoryMock } from './repository/users/users.repository.mock';

export function initializeRoutes(app: Express) {

    const eventsRepo = new EventsRepositoryMock();

    // initializing purchase service injecting implemented repositories
    const purchasesService = new PurchasesService(
        new PurchaseRepositoryMock(),
        new UsersRepositoryMock(),
        eventsRepo,
        new NotificationRepositoryEmail(),
        parseInt(process.env.MAX_TICKETS_PER_EVENT, 10) || 3
    );

    // initializing purchases controller injecting service
    const purchasesController = new PurchasesController(purchasesService);
    
    // initializing events service injecting implemented repositoriy
    const eventsService = new EventsService(eventsRepo);

    // initializing events controller injecting service
    const eventsController = new EventsController(eventsService);
    
    // routes definition
    app.post('/purchase', (req: Request, res: Response) => {
        return purchasesController.purchase(req, res);
    });

    app.get('/purchase/user/:id', async (req: Request, res: Response) => {
        return purchasesController.getByUser(req, res);
    });

    app.get('/events', async (req: Request, res: Response) => {
        return eventsController.getEventsList(req, res);
    });
}