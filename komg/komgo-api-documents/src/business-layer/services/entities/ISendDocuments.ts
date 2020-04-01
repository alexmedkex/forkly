import { Note } from '../../../service-layer/request/outgoing-request/Note'

export interface ISendDocuments {
  companyId: string
  requestId?: string
  documents: string[]
  context?: object
  reviewNotRequired?: boolean
  documentShareNotification?: boolean
  note?: Note
}
