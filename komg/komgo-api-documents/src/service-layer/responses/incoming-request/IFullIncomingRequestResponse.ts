import { IDismissedDocumentType } from '../../../data-layer/models/incoming-request/IDismissedDocumentType'
import { INote } from '../../../data-layer/models/requests/INote'
import { IFullDocumentResponse } from '../document/IFullDocumentResponse'
import { IProductResponse } from '../product'
import { IFullTypeResponse } from '../type/IFullTypeResponse'

export interface IFullIncomingRequestResponse {
  id: string
  product: IProductResponse
  companyId: string
  types: IFullTypeResponse[]
  documents: IFullDocumentResponse[]
  sentDocumentTypes: string[]
  sentDocuments: string[]
  dismissedTypes?: IDismissedDocumentType[]
  deadline?: Date
  createdAt?: Date
  updatedAt?: Date
  notes?: INote[]
}
