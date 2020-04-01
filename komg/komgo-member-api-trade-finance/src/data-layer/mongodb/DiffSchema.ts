import { Schema } from 'mongoose'

export const DiffSchema: Schema = new Schema(
  {
    op: {
      type: String,
      enum: ['_get', 'test', 'copy', 'move', 'replace', 'remove', 'add'],
      required: true
    },
    path: {
      type: String,
      required: true
    },
    from: {
      type: Date
    },
    value: {
      type: Object
    },
    oldValue: {
      type: Object
    },
    type: {
      type: String,
      enum: ['ITrade', 'ICargo', 'ILC']
    }
  },
  { _id: false }
)
