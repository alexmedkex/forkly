import { IFullHasProduct } from '../../data-agents/interfaces/IFullHasProduct'
import { IFullDocument } from '../document/IFullDocument'
import { INote } from '../requests/INote'
import { IFullType } from '../type/IFullType'

import { IDismissedDocumentType } from './IDismissedDocumentType'

export interface IFullIncomingRequest extends IFullHasProduct {
  companyId: string
  types: IFullType[]
  documents: IFullDocument[]
  sentDocumentTypes: string[]
  sentDocuments: string[]
  dismissedTypes?: IDismissedDocumentType[]
  deadline?: Date
  createdAt?: Date
  updatedAt?: Date
  notes?: INote[]
}
