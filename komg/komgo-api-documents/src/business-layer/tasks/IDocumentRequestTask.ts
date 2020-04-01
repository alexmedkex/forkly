import { ITaskCreateRequest } from '@komgo/notification-publisher'

import { IDocumentRequestContext } from './IDocumentRequestContext'

export interface IDocumentRequestTask extends ITaskCreateRequest {
  context: IDocumentRequestContext
}
