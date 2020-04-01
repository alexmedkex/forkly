import { getLogger } from '@komgo/logging'
import { IQuoteBase } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { QuoteDataAgent } from '../../../data-layer/data-agents'
import { TYPES } from '../../../inversify'

@injectable()
export class CreateQuoteUseCase {
  private readonly logger = getLogger('CreateQuoteUseCase')

  constructor(@inject(TYPES.QuoteDataAgent) private readonly quoteDataAgent: QuoteDataAgent) {}

  /**
   * Creates a new quote by saving it in DB
   *
   * @param quote quote request to process
   */
  public async execute(quoteBase: IQuoteBase): Promise<string> {
    this.logger.info('Creating new quote', quoteBase)

    const quote = await this.quoteDataAgent.create(quoteBase)

    return quote.staticId
  }
}
