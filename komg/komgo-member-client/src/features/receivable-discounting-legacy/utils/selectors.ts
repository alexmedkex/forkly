import { IParticipantRFPSummary, IQuote, ReplyType, IParticipantRFPReply, RDStatus } from '@komgo/types'
import { ReceivablesDiscountingRole } from './constants'

// If we have empty strings (`''`), we replace them by `undefined`, to avoid
// problems with number validation on schema.

export const roleRd = (isFinancialInstitution: boolean): ReceivablesDiscountingRole =>
  isFinancialInstitution ? ReceivablesDiscountingRole.Bank : ReceivablesDiscountingRole.Trader

export const buildRdMenuProps = (rdId: string, rdStatus: RDStatus) => {
  if (rdId && rdStatus) {
    return {
      rdId,
      rdStatus
    }
  }
  return undefined
}

export const getReply = (rfpSummary: IParticipantRFPSummary, type: ReplyType): IParticipantRFPReply =>
  rfpSummary && rfpSummary.replies.find(reply => reply.type === type)

export const getQuoteForReplyType = (rfpSummary: IParticipantRFPSummary, replyType: ReplyType): IQuote => {
  const reply = getReply(rfpSummary, replyType)
  return reply && reply.quote
}

export const getReplyCommentForReplyType = (rfpSummary: IParticipantRFPSummary, replyType: ReplyType): string => {
  if (!rfpSummary) {
    return
  }

  const reply = rfpSummary.replies.filter(reply => reply.type === replyType)[0]

  if (!reply || !reply.comment) {
    return
  }

  return reply.comment
}
