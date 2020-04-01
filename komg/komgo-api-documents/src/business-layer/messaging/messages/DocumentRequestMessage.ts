import { DocumentRequestMessageData } from './DocumentRequestMessageData'
import { Message } from './Message'

export class DocumentRequestMessage extends Message {
  context: {
    productId: string
  }

  data: DocumentRequestMessageData
}
