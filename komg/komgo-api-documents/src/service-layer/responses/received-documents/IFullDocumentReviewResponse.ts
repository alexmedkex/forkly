import { IFullDocumentResponse } from '../document/IFullDocumentResponse'

export interface IFullDocumentReviewResponse {
  document: IFullDocumentResponse
  status: string
  note: string
  reviewerId: string
}
