import { Schema } from 'mongoose'

export const StateTransitionSchema: Schema = new Schema({
  fromState: {
    type: String,
    required: false
  },
  toState: {
    type: String,
    required: true
  },
  performer: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
})
