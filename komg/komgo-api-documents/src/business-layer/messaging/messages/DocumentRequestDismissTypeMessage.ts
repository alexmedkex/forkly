import { DocumentRequestDismissTypeData } from './DocumentRequestDismissTypeData'
import { Message } from './Message'

export class DocumentRequestDismissTypeMessage extends Message {
  context: {
    productId: string
  }

  data: {
    requestId: string
    dismissedTypes: DocumentRequestDismissTypeData[]
  }
}
