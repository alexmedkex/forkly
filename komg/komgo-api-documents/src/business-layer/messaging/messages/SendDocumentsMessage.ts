import { DocumentMessageData } from './DocumentMessageData'
import { Message } from './Message'

export class SendDocumentsMessage extends Message {
  context: {
    productId: string
    subProductId?: string
    requestId: string
  }

  data: {
    context: object
    shareId?: string
    documents: DocumentMessageData[]
    reviewNotRequired?: boolean
    documentShareNotification?: boolean
  }
}
