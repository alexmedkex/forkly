import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IQuote } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { QuoteDataAgent } from '../../../data-layer/data-agents'
import { ErrorName } from '../../../ErrorName'
import { TYPES } from '../../../inversify'
import { EntityNotFoundError } from '../../errors'

@injectable()
export class GetQuoteUseCase {
  private readonly logger = getLogger('GetQuoteUseCase')

  constructor(@inject(TYPES.QuoteDataAgent) private readonly quoteDataAgent: QuoteDataAgent) {}

  public async execute(staticId: string): Promise<IQuote> {
    this.logger.info(`Getting Quote for id: ${staticId}`)

    const quote: IQuote = await this.quoteDataAgent.findByStaticId(staticId)
    if (!quote) {
      this.logger.warn(ErrorCode.DatabaseMissingData, ErrorName.QuoteNotFound, { quoteId: staticId })
      throw new EntityNotFoundError(`Quote does not exist with ID: ${staticId}`)
    }

    return quote
  }
}
