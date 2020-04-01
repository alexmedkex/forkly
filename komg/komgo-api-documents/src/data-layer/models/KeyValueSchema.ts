import { Schema } from 'mongoose'

export const KeyValueSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  },
  { _id: false }
)
