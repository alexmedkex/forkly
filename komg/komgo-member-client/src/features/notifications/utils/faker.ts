import { Notification, NotificationLevel } from '../store/types'

export const buildFakeNotification = ({
  context = { type: 'TaskPayload', taskId: 'test-task-id' } as any,
  productId = 'productId',
  type = 'notif.type',
  isRead = true,
  message = 'This is a notification message',
  level = 'success' as NotificationLevel
} = {}): Notification => {
  return {
    _id: '_id',
    toUser: 'user-id',
    createdAt: '2018-10-08T04:35:11.048Z',
    productId,
    context,
    type,
    level,
    isRead,
    message
  }
}
