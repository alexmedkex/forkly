import { ReplyType } from '@komgo/types'
import { Schema } from 'mongoose'

const ReplySchema: Schema = new Schema(
  {
    staticId: {
      type: String,
      required: true,
      unique: true
    },
    type: {
      type: String,
      enum: Object.values(ReplyType),
      required: true
    },
    rdId: {
      type: String,
      required: true,
      index: true
    },
    participantId: {
      type: String,
      required: true
    },
    senderStaticId: {
      type: String,
      required: true
    },
    comment: {
      type: String,
      required: false
    },
    quoteId: {
      type: String,
      required: false,
      index: true
    },
    autoGenerated: {
      type: Boolean,
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

export default ReplySchema