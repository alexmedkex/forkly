import { IFullDocumentResponse } from '../document/IFullDocumentResponse'

export interface IFullDocumentFeedbackResponse {
  document: IFullDocumentResponse
  status: string
  note: string
  reviewerId: string
}
