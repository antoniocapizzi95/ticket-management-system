import { NotificationRepository } from './notification.repository';

export class NotificationRepositorySms implements NotificationRepository {
  sendNotification(user: string, message: string): void {
    console.log(`Sms sent to ${user} with message ${message}`);
  }
}