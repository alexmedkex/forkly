import mongoose from 'mongoose'

export interface IAutoWhitelistDocument extends mongoose.Document {
  startBlockNumber: number
  stopBlockNumber: number
}
