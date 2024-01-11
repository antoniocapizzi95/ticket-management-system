import { NotificationRepository } from './notification.repository';

export class NotificationRepositoryEmail implements NotificationRepository {
  sendNotification(user: string, message: string): void {
    console.log(`Email sent to ${user} with message ${message}`);
  }
}