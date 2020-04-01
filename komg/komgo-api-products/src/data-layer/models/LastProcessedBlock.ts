import DataAccess from '@komgo/data-access'
import * as mongoose from 'mongoose'

import ILastProcessedBlockDocument from './ILastProcessedBlockDocument'
import { LastProcessedBlockSchema } from './LastProcessedBlockSchema'

export type LastProcessedModel = mongoose.Model<ILastProcessedBlockDocument>

export const LastProcessedBlock: LastProcessedModel = DataAccess.connection.model<ILastProcessedBlockDocument>(
  'last-processed-block',
  LastProcessedBlockSchema
)
