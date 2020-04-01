import { getLogger } from '@komgo/logging'
import { ITrade, ITradeSnapshot } from '@komgo/types'
import { injectable } from 'inversify'
import 'reflect-metadata'

import { TradeSnapshotModel } from '../models/trade-snapshot/TradeSnapshotModel'

import { logAndThrowMongoError, toObject } from './utils'

@injectable()
export class TradeSnapshotDataAgent {
  private readonly logger = getLogger('TradeSnapshotDataAgent')
  /**
   * Creates a new trade snapshot and replaces an existing one if it already exists
   *
   * @param tradeSnapshot Trade snapshot to create
   */
  public async updateCreate(tradeSnapshot: ITradeSnapshot): Promise<void> {
    try {
      await TradeSnapshotModel.updateOne(
        { source: tradeSnapshot.source, sourceId: tradeSnapshot.sourceId, createdAt: tradeSnapshot.createdAt },
        { ...tradeSnapshot },
        { upsert: true, timestamps: !tradeSnapshot.createdAt }
      ).exec()
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on TradeSnapshot model: updateCreate')
    }
  }

  public async findByTradeSourceId(tradeSourceId: string): Promise<ITradeSnapshot> {
    try {
      const tradeSnapshotDocument = await TradeSnapshotModel.find({ sourceId: tradeSourceId })
        .limit(1)
        .sort({ createdAt: -1 })
        .exec()
      return tradeSnapshotDocument.length > 0 ? toObject(tradeSnapshotDocument[0]) : null
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on TradeSnapshot model: findByTradeId')
    }
  }

  /**
   * Gets all trade snapshots given a source ID
   *
   * @param sourceId Source ID of the trade
   */
  async findAllBySourceId(sourceId: string): Promise<ITradeSnapshot[]> {
    try {
      const tradeSnapshotDocuments = await TradeSnapshotModel.find({ sourceId })
        .sort({ createdAt: 1 })
        .exec()

      return tradeSnapshotDocuments.map(toObject)
    } catch (error) {
      logAndThrowMongoError(
        this.logger,
        error,
        'Unable to perform Mongo action on TradeSnapshot model: findAllBySourceId'
      )
    }
  }

  /**
   * Stores an updated Trade Snapshot object by appending to the collection
   */
  public async update(tradeSnapshot: ITradeSnapshot): Promise<ITradeSnapshot> {
    try {
      const tsDocument = await TradeSnapshotModel.create(tradeSnapshot)
      return toObject(tsDocument)
    } catch (error) {
      logAndThrowMongoError(
        this.logger,
        error,
        'Unable to perform RD update - Mongo action on TradeSnapshotModel model: create'
      )
    }
  }
}
