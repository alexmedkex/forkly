import { Schema } from 'mongoose'

export const NoteSchema: Schema = new Schema(
  {
    date: {
      type: Date,
      required: true
    },
    sender: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    }
  },
  { _id: false }
)
