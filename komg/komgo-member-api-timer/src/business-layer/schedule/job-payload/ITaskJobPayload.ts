import { ITaskCreateRequest } from '@komgo/notification-publisher'

import { IJobPayload } from '../IJobPayload'

export interface ITaskJobPayload extends IJobPayload {
  task: ITaskCreateRequest
  message: string
}
