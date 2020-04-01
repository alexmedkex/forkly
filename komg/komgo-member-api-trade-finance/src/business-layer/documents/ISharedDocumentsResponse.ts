import { IProductResponse, IDocumentRegisterResponse } from './IDocumentRegisterResponse'

export interface ISharedDocumentsResponse {
  id: string
  context: any
  product: IProductResponse
  companyId: string
  documents: IDocumentFedbackResponse[]
  feedbackReceived: boolean
}

export interface IDocumentFedbackResponse {
  document: IDocumentRegisterResponse
  status: string
  note: string
}
