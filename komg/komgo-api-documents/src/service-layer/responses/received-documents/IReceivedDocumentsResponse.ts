import { IDocumentReviewResponse } from './IDocumentReviewResponse'

export interface IReceivedDocumentsResponse {
  id: string
  productId: string
  companyId: string
  requestId?: string
  context: any
  documents: IDocumentReviewResponse[]
  feedbackSent: boolean
}
