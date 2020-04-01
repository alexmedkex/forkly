import { IDocumentReviewResponse } from './IDocumentReviewResponse'

export interface IReceivedDocumentsAggregationResponse {
  productId: string
  companyId: string
  requestId: string
  documents: IDocumentReviewResponse[]
}
