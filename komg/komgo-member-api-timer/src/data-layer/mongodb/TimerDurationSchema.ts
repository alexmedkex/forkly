import { Schema } from 'mongoose'

import { DurationUnit } from '../models/DurationUnit'
import { DEFAULT_SCHEMA_CONFIG } from '../utils/consts'

/**
 * MongooseSchema
 * @type {"mongoose".Schema}
 * @private
 */
const TimerDurationSchema: Schema = new Schema(
  {
    duration: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true,
      default: DurationUnit.Days,
      enum: [DurationUnit.Seconds, DurationUnit.Minutes, DurationUnit.Hours, DurationUnit.Days, DurationUnit.Weeks]
    }
  },
  { DEFAULT_SCHEMA_CONFIG }
)
export default TimerDurationSchema
