import { DurationUnit } from './DurationUnit'
import { Timer } from './Timer'
import { TimerType } from './TimerType'

describe('Timer', () => {
  it('should be defined', () => {
    expect(Timer).toBeDefined()
  })

  it('should be defined', () => {
    expect(new Timer(new Date(), [], {}, 0, DurationUnit.Days, TimerType.BusinessDays)).toBeDefined()
  })
})
