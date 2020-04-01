import { Schema } from 'mongoose'

export const UnsignedContentSchema: Schema = new Schema(
  {
    fileId: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    }
  },
  { _id: false }
)
