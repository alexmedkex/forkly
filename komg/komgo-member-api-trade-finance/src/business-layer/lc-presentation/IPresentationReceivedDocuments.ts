import { IDocumentReviewResponse } from '../documents/IReceivedDocuments'

export interface IPresentationSharedDocuments {
  companyId: string
  documents: IDocumentReviewResponse[]
  feedbackSent: boolean
}
