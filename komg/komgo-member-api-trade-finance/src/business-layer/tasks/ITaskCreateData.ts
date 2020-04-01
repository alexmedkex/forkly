// tslint:disable-next-line:no-submodule-imports
import { ITaskCreateRequest } from '@komgo/notification-publisher/dist/interfaces'

export interface ITaskCreateData {
  task: ITaskCreateRequest
  notification: {
    message: string
  }
}
