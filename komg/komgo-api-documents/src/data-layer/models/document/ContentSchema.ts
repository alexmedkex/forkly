import { Schema } from 'mongoose'

export const ContentSchema: Schema = new Schema(
  {
    fileId: {
      type: String,
      required: true
    },
    signature: {
      type: String,
      required: false
    },
    size: {
      type: Number,
      required: true
    }
  },
  { _id: false }
)
