import { IProductResponse } from '../product'

import { IFullDocumentFeedbackResponse } from './IFullDocumentFeedbackResponse'

export interface IFullSharedDocumentsResponse {
  id: string
  context: any
  product: IProductResponse
  companyId: string
  documents: IFullDocumentFeedbackResponse[]
  feedbackReceived: boolean
}
