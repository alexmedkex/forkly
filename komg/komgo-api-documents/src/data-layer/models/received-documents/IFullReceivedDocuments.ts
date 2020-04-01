import { IFullHasProduct } from '../../data-agents/interfaces/IFullHasProduct'
import { IFullOutgoingRequest } from '../outgoing-request'

import { IFullDocumentReview } from './IFullDocumentReview'

export interface IFullReceivedDocuments extends IFullHasProduct {
  context: object
  companyId: string
  request?: IFullOutgoingRequest
  shareId?: string
  documents: IFullDocumentReview[]
  feedbackSent: boolean
}
