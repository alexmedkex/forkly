import 'reflect-metadata'

import BackoffTimer from './BackoffTimer'
import IBackoffTimer from './IBackoffTimer'

const maxBackoffMs = 60000
const incrementalBackoffMs = 500

describe('BackoffTimer', () => {
  let backoffTimer: IBackoffTimer

  beforeEach(() => {
    backoffTimer = new BackoffTimer(maxBackoffMs, incrementalBackoffMs)
  })

  it('Should sleep a specified delay on first call', async () => {
    const calculatedDelay = Math.pow(2, 0) * incrementalBackoffMs
    const expectedDelay = Math.min(calculatedDelay, maxBackoffMs)

    const delay = await backoffTimer.sleep()
    expect(delay).toBe(expectedDelay)
  })

  it('Should sleep a specified delay on second call', async () => {
    const calculatedDelay = Math.pow(2, 1) * incrementalBackoffMs
    const expectedDelay = Math.min(calculatedDelay, maxBackoffMs)

    const delay1 = await backoffTimer.sleep()
    const delay2 = await backoffTimer.sleep()

    expect(delay1).toBeLessThan(delay2)
    expect(delay2).toBe(expectedDelay)
  })

  it('Should restart delay on reset', async () => {
    let calculatedDelay = Math.pow(2, 1) * incrementalBackoffMs
    const expectedDelayBeforeReset = Math.min(calculatedDelay, maxBackoffMs)

    await backoffTimer.sleep()
    const delayBeforeReset = await backoffTimer.sleep()
    expect(delayBeforeReset).toBe(expectedDelayBeforeReset)

    backoffTimer.reset()

    calculatedDelay = Math.pow(2, 0) * incrementalBackoffMs
    const expectedDelayAfterReset = Math.min(calculatedDelay, maxBackoffMs)
    const delayAfterReset = await backoffTimer.sleep()

    expect(delayBeforeReset).toBeGreaterThan(delayAfterReset)
    expect(delayAfterReset).toBe(expectedDelayAfterReset)
  })
})
