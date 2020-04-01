import 'jest'
import { getOrElseBackoffStrategy, retry } from './WithRetries'

describe('WithRetries', () => {
  describe('getOrElseBackoffStrategy', () => {
    it('get default value', () => {
      const defaultValue = [1, 2, 3]

      const result = getOrElseBackoffStrategy('non-existing-var', defaultValue)
      expect(result).toBe(defaultValue)
    })

    it('get strategy from environment variable', () => {
      const defaultValue = 'none'
      process.env.BACKOFF_STRATEGY = '[1,2,3]'
      const result = getOrElseBackoffStrategy('BACKOFF_STRATEGY', defaultValue)
      expect(result).toEqual([1, 2, 3])
    })
  })

  describe('retry', () => {
    it('should not attempt to retry if no exception occur', async () => {
      const location = 'location'
      const maxRetries = 5
      const func = jest.fn()
      const retryCondition = _ => true
      const backoffStrategy = [1]
      const returnValue = 'should-return-this-string'

      func.mockReturnValue(returnValue)
      const result = await retry(location, maxRetries, func, retryCondition, backoffStrategy)

      expect(result).toBe(returnValue)
      expect(func).toHaveBeenCalledTimes(1)
    })

    it('should attempt to retry if exception occur and recover if non-exception is returned', async () => {
      const location = 'location'
      const maxRetries = 5
      const func = jest.fn()
      const retryCondition = _ => true
      const backoffStrategy = [1]
      const returnValue = 'should-return-this-string'

      let firstTimeHere = true
      func.mockImplementation(() => {
        if (firstTimeHere) {
          firstTimeHere = false
          throw new Error('please retry')
        } else {
          return returnValue
        }
      })

      const result = await retry(location, maxRetries, func, retryCondition, backoffStrategy)
      expect(result).toBe(returnValue)
      expect(func).toHaveBeenCalledTimes(2)
    })

    it('should attempt to retry until max retries and re-throw exception to caller', async () => {
      const location = 'location'
      const maxRetries = 5
      const func = jest.fn()
      const retryCondition = _ => true
      const backoffStrategy = [1]
      const error = new Error('please retry')

      func.mockImplementation(() => {
        throw error
      })

      const call = retry(location, maxRetries, func, retryCondition, backoffStrategy)
      await expect(call).rejects.toThrowError(error)
      expect(func).toHaveBeenCalledTimes(6)
    })
  })
})
