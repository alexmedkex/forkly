import { IHasProduct } from '../../data-agents/interfaces/IHasProduct'

import { IDocumentReview } from './IDocumentReview'

export interface IReceivedDocuments extends IHasProduct {
  companyId: string
  requestId?: string
  shareId?: string
  context: object
  documents: IDocumentReview[]
  feedbackSent: boolean
}
