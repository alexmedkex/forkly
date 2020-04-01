import { LCPresentationDocumentStatus } from '@komgo/types'

export interface ILCPresentationDocument {
  documentId?: string
  documentHash: string
  status?: LCPresentationDocumentStatus
  documentTypeId: string
  dateProvided: Date
}
