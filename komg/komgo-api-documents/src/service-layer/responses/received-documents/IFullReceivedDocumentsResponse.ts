import { IProductResponse } from '../product'
import { IFullOutgoingRequestResponse } from '../request/IFullRequestResponse'

import { IFullDocumentReviewResponse } from './IFullDocumentReviewResponse'

export interface IFullReceivedDocumentsResponse {
  id: string
  context: any
  product: IProductResponse
  companyId: string
  request?: IFullOutgoingRequestResponse
  documents: IFullDocumentReviewResponse[]
  feedbackSent: boolean
}
