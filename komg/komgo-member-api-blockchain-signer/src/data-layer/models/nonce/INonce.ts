import * as mongoose from 'mongoose'

export interface INonce extends mongoose.Document {
  address: string
  nonce: number
}
