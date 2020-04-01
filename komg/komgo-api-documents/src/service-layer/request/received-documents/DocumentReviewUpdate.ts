import { IsDefined, IsEnum } from 'class-validator'

import { FEEDBACK_STATUS } from '../../../business-layer/messaging/enums'

export class DocumentReviewUpdate {
  @IsDefined()
  documentId: string

  @IsDefined()
  @IsEnum(FEEDBACK_STATUS)
  status: FEEDBACK_STATUS

  @IsDefined()
  note: string
}
