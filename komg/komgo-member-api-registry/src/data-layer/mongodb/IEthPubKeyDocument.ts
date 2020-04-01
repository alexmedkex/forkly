import * as mongoose from 'mongoose'

export interface IEthPubKeyDocument extends mongoose.Document {
  key: string
  effDate: number
  termDate: number
  address: string
  current: boolean
  revoked: boolean
}
