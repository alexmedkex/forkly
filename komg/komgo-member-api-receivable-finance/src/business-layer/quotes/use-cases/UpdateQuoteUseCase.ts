import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ReplyType, IQuoteBase, IQuote } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { QuoteDataAgent, ReplyDataAgent, ReceivablesDiscountingDataAgent } from '../../../data-layer/data-agents'
import { ErrorName } from '../../../ErrorName'
import { TYPES } from '../../../inversify'
import { EntityNotFoundError, ValidationFieldError } from '../../errors'
import { QuoteValidator } from '../../validation'

@injectable()
export class UpdateQuoteUseCase {
  private readonly logger = getLogger('UpdateQuoteUseCase')

  constructor(
    @inject(TYPES.QuoteDataAgent) private readonly quoteDataAgent: QuoteDataAgent,
    @inject(TYPES.ReplyDataAgent) private readonly replyDataAgent: ReplyDataAgent,
    @inject(TYPES.ReceivablesDiscountingDataAgent) private readonly rdDataAgent: ReceivablesDiscountingDataAgent,
    @inject(TYPES.QuoteValidator) private readonly quoteValidator: QuoteValidator
  ) {}

  public async execute(quoteId: string, updatedQuote: IQuoteBase): Promise<IQuote> {
    this.logger.info('Updating quote', { quoteId })

    const oldQuote = await this.quoteDataAgent.findByStaticId(quoteId)
    if (!oldQuote) {
      this.logger.warn(ErrorCode.DatabaseMissingData, ErrorName.QuoteNotFound, { quoteId })
      throw new EntityNotFoundError(`Quote not found with ID - ${quoteId}`)
    }

    await this.validate(quoteId, ReplyType.Accepted, updatedQuote)

    return this.quoteDataAgent.update(quoteId, updatedQuote)
  }

  private async validate(quoteId: string, replyType: ReplyType, updatedQuote: IQuoteBase) {
    const foundReply = await this.replyDataAgent.findByQuoteIdAndType(quoteId, replyType)

    if (!foundReply) {
      const msg = 'RFP Reply not found for the given quote and type'
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.RFPReplyNotFound, msg, {
        quoteId,
        replyType
      })
      throw new ValidationFieldError(msg, {
        quoteId: ['The corresponding Receivable discounting is in an incorrect state to perform this action']
      })
    }

    const rd = await this.rdDataAgent.findByStaticId(foundReply.rdId)
    this.quoteValidator.validateFieldsBase(updatedQuote, rd)
  }
}
