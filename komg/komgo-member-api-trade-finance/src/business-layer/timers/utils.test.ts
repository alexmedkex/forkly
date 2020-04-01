import { convertDurationUnit, validateLCTimerDuration } from './utils'
import { TimerDurationUnit } from '@komgo/types'

describe('utils', () => {
  it('convertDurationUnit', async () => {
    expect(convertDurationUnit(TimerDurationUnit.Seconds, 10)).toEqual(10 * 1000)
    expect(convertDurationUnit(TimerDurationUnit.Minutes, 10)).toEqual(10 * 1000 * 60)
    expect(convertDurationUnit(TimerDurationUnit.Hours, 10)).toEqual(10 * 1000 * 60 * 60)
    expect(convertDurationUnit(TimerDurationUnit.Days, 10)).toEqual(10 * 1000 * 60 * 60 * 24)
    expect(convertDurationUnit(TimerDurationUnit.Weeks, 10)).toEqual(10 * 1000 * 60 * 60 * 24 * 7)
  })

  it('convertDurationUnit', async () => {
    expect(validateLCTimerDuration(TimerDurationUnit.Seconds, 10)).toEqual(false)
    expect(validateLCTimerDuration(TimerDurationUnit.Minutes, 59)).toEqual(false)
    expect(validateLCTimerDuration(TimerDurationUnit.Days, 8)).toEqual(false)
    expect(validateLCTimerDuration(TimerDurationUnit.Weeks, 2)).toEqual(false)

    expect(validateLCTimerDuration(TimerDurationUnit.Hours, 1)).toEqual(true)
    expect(validateLCTimerDuration(TimerDurationUnit.Minutes, 60)).toEqual(true)
    expect(validateLCTimerDuration(TimerDurationUnit.Hours, 25)).toEqual(true)
    expect(validateLCTimerDuration(TimerDurationUnit.Days, 1)).toEqual(true)
    expect(validateLCTimerDuration(TimerDurationUnit.Weeks, 1)).toEqual(true)
  })
})
