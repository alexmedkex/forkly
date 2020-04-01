import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ReplyType } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ReplyDataAgent } from '../../../data-layer/data-agents'
import { IReply } from '../../../data-layer/models/replies/IReply'
import { ErrorName } from '../../../ErrorName'
import { TYPES } from '../../../inversify/types'
import { ValidationFieldError } from '../../errors'
import { OutboundPublisher, OutboundMessageFactory } from '../../messaging'
import { UpdateType } from '../../types'

import { GetQuoteUseCase } from './GetQuoteUseCase'

@injectable()
export class ShareQuoteUseCase {
  private readonly logger = getLogger('ShareQuoteUseCase')

  constructor(
    @inject(TYPES.GetQuoteUseCase) private readonly getQuoteUseCase: GetQuoteUseCase,
    @inject(TYPES.ReplyDataAgent) private readonly replyDataAgent: ReplyDataAgent,
    @inject(TYPES.OutboundMessageFactory)
    private readonly outboundMessageFactory: OutboundMessageFactory,
    @inject(TYPES.OutboundPublisher) private readonly outboundPublisher: OutboundPublisher
  ) {}

  public async execute(quoteId: string): Promise<void> {
    this.logger.info(`Sharing final agreed terms`, {
      quoteId
    })

    const quote = await this.getQuoteUseCase.execute(quoteId)

    const acceptedReply = await this.replyDataAgent.findByQuoteIdAndType(quoteId, ReplyType.Accepted)

    this.validateRFPReplyExists(acceptedReply, quoteId)

    const outboundMessage = this.outboundMessageFactory.createRDUpdateMessage(
      acceptedReply.rdId,
      quote,
      UpdateType.FinalAgreedTermsData
    )
    // Here the bank shares with the trader, so the recipient static id is the sender of the reply
    await this.outboundPublisher.send(acceptedReply.senderStaticId, outboundMessage)

    this.logger.info('Quote shared successfully', {
      quoteId,
      rdId: acceptedReply.rdId
    })
  }

  private validateRFPReplyExists(foundReply: IReply, quoteId: string) {
    if (!foundReply) {
      const msg = 'RFP Reply not found for the given quote and type'
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.RFPReplyNotFound, msg, {
        quoteId,
        replyType: ReplyType.Accepted
      })
      throw new ValidationFieldError(msg, {
        quoteId: ['The corresponding Receivable discounting is in an incorrect state to perform this action']
      })
    }
  }
}
