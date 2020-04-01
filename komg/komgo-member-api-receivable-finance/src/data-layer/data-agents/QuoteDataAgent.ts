import { getLogger } from '@komgo/logging'
import { IQuoteBase, IQuote } from '@komgo/types'
import { injectable } from 'inversify'
import 'reflect-metadata'

import { QuoteModel } from '../models/quote/QuoteModel'

import { toObject, logAndThrowMongoError, toExtended } from './utils'

@injectable()
export class QuoteDataAgent {
  private readonly logger = getLogger('QuoteDataAgent')

  public async create(quote: IQuoteBase): Promise<IQuote> {
    try {
      const quoteDocument = await QuoteModel.create(toExtended(quote))

      return toObject(quoteDocument)
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on Quote model: create')
    }
  }

  public async updateCreate(quote: IQuote): Promise<void> {
    try {
      await QuoteModel.updateOne(
        { staticId: quote.staticId, createdAt: quote.createdAt },
        { ...quote },
        { upsert: true, timestamps: false, setDefaultsOnInsert: true }
      ).exec()
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on Quote model: updateCreate')
    }
  }

  public async update(staticId: string, quote: IQuoteBase): Promise<IQuote> {
    try {
      const quoteDocument = await QuoteModel.create({ ...quote, staticId })
      return toObject(quoteDocument)
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on QuoteModel model: update')
    }
  }

  public async findByStaticId(staticId: string): Promise<IQuote> {
    try {
      const quoteDocuments = await QuoteModel.find({ staticId })
        .limit(1)
        .sort({ createdAt: -1 })
        .exec()
      return quoteDocuments.length > 0 ? toObject(quoteDocuments[0]) : null
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on Quote model: findByStaticId')
    }
  }

  async findAllByStaticId(staticId: string): Promise<IQuote[]> {
    try {
      const quoteDocuments = await QuoteModel.find({ staticId })
        .sort({ createdAt: 1 })
        .exec()

      return quoteDocuments.map(toObject)
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on Quote model: findAllByStaticId')
    }
  }
}
