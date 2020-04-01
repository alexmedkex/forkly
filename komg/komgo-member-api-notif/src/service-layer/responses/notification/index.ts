import { NotificationLevel } from '../../request/notification'

export interface INotification {
  _id: string
  productId: string
  type: string
  createdAt: Date
  level: NotificationLevel
  isRead: boolean
  toUser: string
  context: any
  message: string
}

export interface INotificationResponse {
  total: number
  unread: number
  notifications: INotification[]
}
