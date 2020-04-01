import { Schema } from 'mongoose'
import { TimerType, TimerDurationUnit } from '@komgo/types'

export const TimerSchema: Schema = new Schema({
  unit: {
    type: String,
    required: true,
    enum: Object.values(TimerDurationUnit)
  },
  duration: {
    type: Number,
    required: true
  },
  timerStaticId: {
    type: String,
    required: false
  },
  timerType: {
    type: String,
    required: false,
    enum: Object.values(TimerType)
  }
})
