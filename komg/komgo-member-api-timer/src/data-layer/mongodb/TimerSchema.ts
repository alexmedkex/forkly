import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { TimerStatus } from '../models/TimerStatus'
import { TimerType } from '../models/TimerType'
import { DEFAULT_SCHEMA_CONFIG } from '../utils/consts'

import TimerDataSchema from './TimerDataSchema'
import TimerDurationSchema from './TimerDurationSchema'

/**
 * MongooseSchema
 * @type {"mongoose".Schema}
 * @private
 */
const TimerSchema: Schema = new Schema(
  {
    staticId: {
      type: String,
      default: uuid4
    },
    submissionDateTime: {
      type: Date,
      required: true
    },
    timerType: {
      type: String,
      required: true,
      default: TimerType.CalendarDays,
      enum: [TimerType.CalendarDays, TimerType.BusinessDays]
    },
    duration: {
      type: TimerDurationSchema,
      required: true
    },
    timerData: {
      type: [TimerDataSchema],
      required: true
    },
    context: {
      type: Object,
      required: true
    },
    status: {
      type: String,
      required: true,
      default: TimerStatus.InProgress,
      enum: [TimerStatus.InProgress, TimerStatus.Cancelled, TimerStatus.Closed, TimerStatus.Completed]
    },
    deletedAt: {
      type: Date
    }
  },
  DEFAULT_SCHEMA_CONFIG
)
export default TimerSchema
