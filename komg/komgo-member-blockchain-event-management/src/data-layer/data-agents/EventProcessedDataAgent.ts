import { getLogger } from '@komgo/logging'
import { injectable } from 'inversify'

import { EventProcessed, IEventProcessedDocument } from '../models/events'

import { logAndThrowMongoError } from './utils'

@injectable()
export class EventProcessedDataAgent {
  private readonly logger = getLogger('EventProcessedDataAgent')

  async getLastEventProcessed(): Promise<IEventProcessedDocument> {
    try {
      return await EventProcessed.findOne({}).exec()
    } catch (error) {
      logAndThrowMongoError(
        this.logger,
        error,
        'Unable to perform Mongo action on EventProcessed model: getLastEventProcessed'
      )
    }
  }

  async saveEventProcessed(blockNumber: number, transactionHash: string, logIndex: number): Promise<void> {
    try {
      await EventProcessed.findOneAndUpdate(
        {},
        {
          $set: {
            blockNumber,
            transactionHash,
            logIndex
          }
        },
        { upsert: true }
      ).exec()
    } catch (error) {
      logAndThrowMongoError(
        this.logger,
        error,
        'Unable to perform Mongo action on EventProcessed model: saveEventProcessed'
      )
    }
  }
}
