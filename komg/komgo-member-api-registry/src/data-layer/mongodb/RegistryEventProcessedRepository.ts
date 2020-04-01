import DataAccess from '@komgo/data-access'
import * as mongoose from 'mongoose'

import { IRegistryEventProcessedDocument } from './IRegistryEventProcessedDocument'

export type RegistryEventProcessedModel = mongoose.Model<IRegistryEventProcessedDocument>

const RegistryEventProcessedSchema: mongoose.Schema = new mongoose.Schema({
  blockNumber: {
    type: Number,
    required: true
  },
  transactionIndex: {
    type: Number,
    required: true
  },
  logIndex: {
    type: Number,
    required: true
  }
})

export const EventProcessedRepo: RegistryEventProcessedModel = DataAccess.connection.model<
  IRegistryEventProcessedDocument
>('registryEventProcessed', RegistryEventProcessedSchema)
