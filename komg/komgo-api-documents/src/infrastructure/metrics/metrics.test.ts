import 'jest'
import 'reflect-metadata'

const metricMock = jest.fn()

jest.mock('@komgo/logging', () => {
  return {
    // Mock default export of 'komgo/logging'
    default: {
      metric: metricMock
    }
  }
})

import { Result } from './consts'
import { MeterOutcome } from './metrics'

const METRIC = 'metric'
const expectedResult = 42
const expectedError = 'failed test method'

class Test {
  @MeterOutcome(METRIC)
  async success() {
    return expectedResult
  }

  @MeterOutcome(METRIC)
  async failure() {
    throw new Error(expectedError)
  }
}

describe('metrics', () => {
  const testClass = new Test()

  beforeAll(() => {
    jest.resetAllMocks()
  })

  it('meters a successful outcome of a successful execution', async () => {
    const res = await testClass.success()

    expect(res).toEqual(expectedResult)
    expect(metricMock).toHaveBeenCalledTimes(1)
    expect(metricMock).toHaveBeenCalledWith({
      [METRIC]: Result.Success
    })
  })

  it('meters unsuccessful outcome of an unsuccessful execution', async () => {
    const call = testClass.failure()

    await expect(call).rejects.toThrowError(new Error(expectedError))
    expect(metricMock).toHaveBeenCalledTimes(1)
    expect(metricMock).toHaveBeenCalledWith({
      [METRIC]: Result.Error
    })
  })
})
