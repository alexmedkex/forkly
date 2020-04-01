import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

const TimerExecutionLogSchema: Schema = new Schema({
  executionTime: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  payload: {
    type: Object,
    default: {},
    required: true
  },
  context: {
    type: Object,
    required: true
  },
  success: {
    type: Boolean,
    required: true
  }
})
export default TimerExecutionLogSchema
