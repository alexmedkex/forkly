import { FEEDBACK_STATUS } from '../../../business-layer/messaging/enums'
import { IFullDocument } from '../document'

export interface IFullDocumentReview {
  document: IFullDocument
  status: FEEDBACK_STATUS
  note: string
  reviewerId: string
}
