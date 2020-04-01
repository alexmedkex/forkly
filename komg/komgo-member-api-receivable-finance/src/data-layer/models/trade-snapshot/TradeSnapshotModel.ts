import DataAccess from '@komgo/data-access'
import { getLogger } from '@komgo/logging'
import mongoose from 'mongoose'

import { logIndexCreation } from '../utils/logIndexCreation'

import { ITradeSnapshotDocument } from './ITradeSnapshotDocument'
import TradeSnapshotSchema from './TradeSnapshotSchema'

export type TradeSnapshotModel = mongoose.Model<ITradeSnapshotDocument>

export const TradeSnapshotModel: TradeSnapshotModel = DataAccess.connection.model<ITradeSnapshotDocument>(
  'trade-snapshots',
  TradeSnapshotSchema
)

logIndexCreation(getLogger('TradeSnapshotModel'), TradeSnapshotModel)
