import * as mongoose from 'mongoose'

export interface IMessagingPubKeyDocument extends mongoose.Document {
  key: string
  effDate: number
  termDate: number
  current: boolean
  revoked: boolean
}
