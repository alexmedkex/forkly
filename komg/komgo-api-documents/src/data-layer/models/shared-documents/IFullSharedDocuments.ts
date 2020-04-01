import { IFullHasProduct } from '../../data-agents/interfaces/IFullHasProduct'
import { IFullIncomingRequest } from '../incoming-request'

import { IFullDocumentFeedback } from './IFullDocumentFeedback'

export interface IFullSharedDocuments extends IFullHasProduct {
  context: object
  companyId: string
  request?: IFullIncomingRequest
  documents: IFullDocumentFeedback[]
  feedbackReceived: boolean
}
