import { ITaskCreateRequest } from '@komgo/notification-publisher'

import { IReceivedDocumentsContext } from './IReceivedDocumentsContext'

export interface IReceivedDocumentsTask extends ITaskCreateRequest {
  context: IReceivedDocumentsContext
}
