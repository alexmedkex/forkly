import { INotificationCreateRequest } from '@komgo/notification-publisher'

import { IJobPayload } from '../IJobPayload'

export interface INotificationJobPayload extends IJobPayload {
  notification: INotificationCreateRequest
}
