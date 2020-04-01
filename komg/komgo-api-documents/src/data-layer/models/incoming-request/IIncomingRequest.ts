import { IHasProduct } from '../../data-agents/interfaces/IHasProduct'
import { INote } from '../requests/INote'

import { IDismissedDocumentType } from './IDismissedDocumentType'

/**
 * State of a received document request. It is created from
 * a document request sent from another node. It contains list of
 * documents that will be sent as a reply to a document request.
 */
export interface IIncomingRequest extends IHasProduct {
  id: string
  productId: string
  companyId: string
  types: string[]
  documents: string[]
  sentDocumentTypes: string[]
  sentDocuments: string[]
  dismissedTypes?: IDismissedDocumentType[]
  deadline?: Date
  createdAt?: Date
  updatedAt?: Date
  notes?: INote[]
}
