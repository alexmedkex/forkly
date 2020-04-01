import { IDocumentRegisterResponse, IProductResponse, ITypeResponse } from './IDocumentRegisterResponse'

export interface IReceivedDocumentsResponse {
  id: string
  context: any
  product: IProductResponse
  companyId: string
  request?: IOutgoingRequestResponse
  documents: IDocumentReviewResponse[]
  feedbackSent: boolean
}

export interface IDocumentReviewResponse {
  document: IDocumentRegisterResponse
  status: string
  note: string
}

export interface IOutgoingRequestResponse {
  id: string
  product: IProductResponse
  companyId: string
  types: ITypeResponse[]
}

export enum DOCUMENT_STATUS {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected'
}
