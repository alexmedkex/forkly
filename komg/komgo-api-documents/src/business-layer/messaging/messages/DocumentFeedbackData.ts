import { IsDefined } from 'class-validator'

import { FEEDBACK_STATUS } from '../enums'

export class DocumentFeedbackData {
  @IsDefined()
  id: string // Document ID

  notes?: string // Feedback notes

  @IsDefined()
  status: FEEDBACK_STATUS

  @IsDefined()
  newVersionRequested: boolean
}
