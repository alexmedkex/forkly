import { IDocumentFedbackResponse } from '../documents/ISharedDocumentsResponse'

export interface IPresentationSharedDocuments {
  companyId: string
  documents: IDocumentFedbackResponse[]
  feedbackReceived: boolean
}
