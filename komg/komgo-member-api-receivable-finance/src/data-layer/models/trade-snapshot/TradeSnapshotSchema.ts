import { Schema } from 'mongoose'

const TradeSnapshotSchema: Schema = new Schema(
  {
    source: {
      type: String,
      required: true
    },
    sourceId: {
      type: String,
      required: true,
      index: true
    },
    trade: {
      type: Object,
      required: true
    },
    movements: {
      type: [Object],
      required: false
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    toObject: {
      transform(doc, ret) {
        delete ret._id
      }
    },
    toJSON: {
      transform(doc, ret) {
        delete ret._id
      }
    }
  }
)

TradeSnapshotSchema.index({ source: 1, sourceId: 1 })

export default TradeSnapshotSchema
