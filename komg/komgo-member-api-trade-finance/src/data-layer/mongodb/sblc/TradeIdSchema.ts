import { Schema } from 'mongoose'
import { TradeSource } from '@komgo/types'

export const TradeIdSchema: Schema = new Schema({
  source: {
    type: String,
    enum: Object.values(TradeSource),
    required: true
  },
  sourceId: {
    type: String,
    required: true
  }
})
