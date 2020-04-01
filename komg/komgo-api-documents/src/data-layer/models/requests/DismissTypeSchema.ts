import { Schema } from 'mongoose'

export const DismissTypeSchema: Schema = new Schema(
  {
    typeId: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    }
  },
  { _id: false }
)
