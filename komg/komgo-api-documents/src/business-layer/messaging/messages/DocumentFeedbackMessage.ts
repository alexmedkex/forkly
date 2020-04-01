import { DocumentFeedbackData } from './DocumentFeedbackData'
import { Message } from './Message'

export class DocumentFeedbackMessage extends Message {
  context: {
    productId: string
  }

  data: {
    requestId?: string
    shareId?: string
    documents: DocumentFeedbackData[]
  }
}
