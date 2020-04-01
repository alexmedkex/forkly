import { Schema } from 'mongoose'

const TradeAndCargoSnapshotSchema: Schema = new Schema(
  {
    source: {
      type: String,
      required: true
    },
    sourceId: {
      type: String,
      required: true
    },
    trade: {
      type: {},
      required: true
    },
    cargo: {
      type: {}
    }
  },
  { timestamps: true }
)

export default TradeAndCargoSnapshotSchema
