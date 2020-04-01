import { FEEDBACK_STATUS } from '../../../business-layer/messaging/enums'
import { IFullDocument } from '../document'

export interface IFullDocumentFeedback {
  document: IFullDocument
  status: FEEDBACK_STATUS
  note: string
  newVersionRequested: boolean
  reviewerId: string
}
