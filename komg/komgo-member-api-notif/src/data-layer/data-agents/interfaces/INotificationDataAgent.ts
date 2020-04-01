import { INotification } from '../../../service-layer/responses/notification'
import { INotificationCreateRequest, INotificationPatchIsRead } from '../../../service-layer/request/notification'

export interface INotificationDataAgent {
  createNotification(notification: INotificationCreateRequest): Promise<INotification>
  getNotifications(userId: string, offset?: number, limit?: number): Promise<INotification[]>
  getNotificationById(id: string): Promise<INotification>
  getNotificationsCount(userId: string, unreadOnly?: boolean): Promise<number>
  updateNotificationIsRead(id: string, data: INotificationPatchIsRead): Promise<void>
  findAndUpdateNotificationsIsRead(toUser: string, data: INotificationPatchIsRead): Promise<void>
}
