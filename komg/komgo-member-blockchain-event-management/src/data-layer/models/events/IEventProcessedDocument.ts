import mongoose from 'mongoose'

export interface IEventProcessedDocument extends mongoose.Document {
  blockNumber: number
  transactionHash: string
  logIndex: number
}
