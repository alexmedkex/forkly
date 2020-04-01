import { IReceivablesDiscounting, ReplyType, IQuote } from '@komgo/types'
import { inject, injectable } from 'inversify'
import { v4 as uuid4 } from 'uuid'

import { IReply } from '../../data-layer/models/replies/IReply'
import { VALUES } from '../../inversify'
import { ITimestamp, timestamp } from '../../utils/timestamp'

@injectable()
export class ReplyFactory {
  constructor(@inject(VALUES.CompanyStaticId) private readonly companyStaticId: string) {}

  public createQuoteReply(
    rd: IReceivablesDiscounting,
    type: ReplyType,
    quote: IQuote,
    participantId: string,
    comment?: string
  ): IReply & ITimestamp {
    return timestamp({
      staticId: uuid4(),
      rdId: rd.staticId,
      type,
      senderStaticId: this.companyStaticId,
      participantId,
      comment,
      quoteId: quote.staticId
    })
  }

  public createRDReply(
    rd: IReceivablesDiscounting,
    type: ReplyType,
    participantId: string,
    comment?: string
  ): IReply & ITimestamp {
    return timestamp({
      staticId: uuid4(),
      rdId: rd.staticId,
      type,
      senderStaticId: this.companyStaticId,
      participantId,
      comment
    })
  }
}
