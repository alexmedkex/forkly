import { INotificationCreateRequest } from '@komgo/notification-publisher'

export interface IDocumentFeedbackNotification extends INotificationCreateRequest {
  context: {
    companyId: string
  }
}
