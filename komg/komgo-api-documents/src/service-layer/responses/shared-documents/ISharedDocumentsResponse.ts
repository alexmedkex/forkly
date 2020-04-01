import { IDocumentFeedbackResponse } from './IDocumentFeedbackResponse'

export interface ISharedDocumentsResponse {
  id: string
  productId: string
  companyId: string
  requestId?: string
  context: any
  documents: IDocumentFeedbackResponse[]
  feedbackReceived: boolean
}
