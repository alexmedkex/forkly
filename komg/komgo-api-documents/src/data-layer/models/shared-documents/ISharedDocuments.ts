import { IHasProduct } from '../../data-agents/interfaces/IHasProduct'

import { IDocumentFeedback } from './IDocumentFeedback'

export interface ISharedDocuments extends IHasProduct {
  companyId: string
  requestId?: string
  context: object
  documents: IDocumentFeedback[]
  feedbackReceived: boolean
}
