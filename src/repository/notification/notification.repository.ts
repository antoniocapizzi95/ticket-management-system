
export interface NotificationRepository {
  sendNotification(user: string, message: string): void;
}