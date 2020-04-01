import { IsDefined } from 'class-validator'

import { QuoteSubmission } from './QuoteSubmission'

export class QuoteAccept extends QuoteSubmission {
  @IsDefined()
  participantStaticId: string
}
