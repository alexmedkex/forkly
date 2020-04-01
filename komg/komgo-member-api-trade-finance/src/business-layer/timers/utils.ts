import * as moment from 'moment'
import { TimerDurationUnit } from '@komgo/types'

export const validateLCTimerDuration = (unit: TimerDurationUnit, duration: number) => {
  const minDuration = convertDurationUnit(TimerDurationUnit.Hours, 1)
  const maxDuration = convertDurationUnit(TimerDurationUnit.Weeks, 1)
  const dueDateDuration = convertDurationUnit(unit, duration)
  return dueDateDuration >= minDuration && dueDateDuration <= maxDuration
}

export const convertDurationUnit = (unit: TimerDurationUnit, duration: number): number => {
  switch (unit) {
    case TimerDurationUnit.Seconds:
      return moment.duration(duration, 'seconds').asMilliseconds()
    case TimerDurationUnit.Minutes:
      return moment.duration(duration, 'minutes').asMilliseconds()
    case TimerDurationUnit.Hours:
      return moment.duration(duration, 'hours').asMilliseconds()
    case TimerDurationUnit.Days:
      return moment.duration(duration, 'days').asMilliseconds()
    case TimerDurationUnit.Weeks:
      return moment.duration(duration, 'weeks').asMilliseconds()
  }
  return 0
}

export const calculateDate = (date: Date, unit: TimerDurationUnit, duration: number) => {
  return moment(date)
    .add(convertDurationUnit(unit, duration), 'millisecond')
    .toDate()
}
