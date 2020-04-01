import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { TimerDataStatus } from '../models/TimerDataStatus'
import { DEFAULT_SCHEMA_CONFIG } from '../utils/consts'

import TimerExecutionLogSchema from './TimerExecutionLogSchema'

/**
 * MongooseSchema
 * @type {"mongoose".Schema}
 * @private
 */
const TimerDataSchema: Schema = new Schema(
  {
    timerId: {
      type: String,
      default: uuid4
    },
    time: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      required: true,
      default: TimerDataStatus.Pending,
      enum: [
        TimerDataStatus.Pending,
        TimerDataStatus.Completed,
        TimerDataStatus.Cancelled,
        TimerDataStatus.Closed,
        TimerDataStatus.Failed
      ]
    },
    retry: {
      type: Number,
      default: 0,
      required: true
    },
    payload: {
      type: Object,
      default: {},
      required: true
    },
    executionLog: {
      type: [TimerExecutionLogSchema],
      required: false,
      default: []
    }
  },
  { DEFAULT_SCHEMA_CONFIG }
)
export default TimerDataSchema
