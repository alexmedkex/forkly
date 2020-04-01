import { IsUUID } from 'class-validator'

import { RFPReply } from './RFPReply'

export class QuoteSubmission extends RFPReply {
  @IsUUID()
  quoteId: string
}
