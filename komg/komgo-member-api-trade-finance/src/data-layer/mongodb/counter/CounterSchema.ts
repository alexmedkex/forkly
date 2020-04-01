import { Schema } from 'mongoose'

export const CounterSchema: Schema = new Schema({
  type: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  context: {
    type: Object,
    required: true
  }
})
