import * as mongoose from 'mongoose'

export interface IRegistryEventProcessedDocument extends mongoose.Document {
  blockNumber: number
  transactionIndex: number
  logIndex: number
}
