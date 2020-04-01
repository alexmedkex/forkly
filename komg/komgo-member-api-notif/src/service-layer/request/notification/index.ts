import { IRequiredPermission } from '../task'
import { IEmailTemplateData } from '@komgo/types'

export enum NotificationLevel {
  success = 'success',
  info = 'info',
  warning = 'warning',
  danger = 'danger'
}

export interface INotificationCreateRequest {
  productId: string
  type: string
  level: NotificationLevel
  toUser?: string
  emailData?: IEmailTemplateData
  requiredPermission?: IRequiredPermission
  context: any
  message: string
}

export interface INotificationPatchIsRead {
  isRead: boolean
}
