import { ITaskCreateRequest } from '@komgo/notification-publisher'

export interface ITaskCreateData {
  task: ITaskCreateRequest
  notification: {
    message: string
  }
}
