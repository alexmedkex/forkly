import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IQuote, IHistory } from '@komgo/types'
import { inject, injectable } from 'inversify'

import { QuoteDataAgent } from '../../../data-layer/data-agents'
import { ErrorName } from '../../../ErrorName'
import { TYPES } from '../../../inversify'
import { createHistory } from '../../../utils'
import { EntityNotFoundError } from '../../errors'

@injectable()
export class GetQuoteHistoryUseCase {
  private readonly logger = getLogger('GetQuoteHistoryUseCase')

  constructor(@inject(TYPES.QuoteDataAgent) private readonly quoteDataAgent: QuoteDataAgent) {}

  public async execute(quoteId: string): Promise<IHistory<IQuote>> {
    this.logger.info('Get history for quote', { quoteId })

    const quotes = await this.quoteDataAgent.findAllByStaticId(quoteId)
    this.logger.info(`found ${quotes.length} quotes`, { quoteId })
    if (quotes.length === 0) {
      this.logger.warn(ErrorCode.DatabaseMissingData, ErrorName.QuoteNotFound, {
        quoteId
      })
      throw new EntityNotFoundError(`Quote not found with ID - ${quoteId}`)
    }

    const history = createHistory(quotes)
    return history ? history : {}
  }
}
