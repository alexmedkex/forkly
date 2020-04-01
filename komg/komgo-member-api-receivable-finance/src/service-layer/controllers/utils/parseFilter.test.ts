import { getLogger } from '@komgo/logging'
import { compressToEncodedURIComponent } from 'lz-string'

import { ValidationFieldError } from '../../../business-layer/errors'

import { parseFilter, MAX_TRADE_SOURCE_IDS } from './parseFilter'

describe('parseFilter', () => {
  const logger = getLogger('parseFilterTest')

  it('should return an empty object if filter is not empty', () => {
    const result = parseFilter(logger, '')
    expect(result).toEqual({})
  })

  it('should return a filter object successfully', () => {
    const filter = compressToEncodedURIComponent(JSON.stringify({ tradeSourceIds: ['trade1', 'trade2'] }))

    const result = parseFilter(logger, filter)
    expect(result).toEqual({ tradeSourceIds: ['trade1', 'trade2'] })
  })

  it('should fail with a ValidationFieldError if the filter does not contain an array', () => {
    const filter = compressToEncodedURIComponent(JSON.stringify({ tradeSourceIds: 'notAnArray' }))

    try {
      parseFilter(logger, filter)
      fail('Expected failure')
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationFieldError)
      expect(error.validationErrors).toEqual({
        filter: {
          tradeSourceIds: ['tradeSourceIds should be an array']
        }
      })
    }
  })

  it('should fail with a ValidationFieldError if the filter contains too many trades', () => {
    const tradeSourceIds = []
    for (let i = 0; i < MAX_TRADE_SOURCE_IDS + 1; i++) {
      tradeSourceIds.push(i)
    }

    const filter = compressToEncodedURIComponent(JSON.stringify({ tradeSourceIds }))

    try {
      parseFilter(logger, filter)
      fail('Expected failure')
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationFieldError)
      expect(error.validationErrors).toEqual({
        filter: {
          tradeSourceIds: [`Too many trades provided - should be less than ${MAX_TRADE_SOURCE_IDS}`]
        }
      })
    }
  })

  it('should fail with a ValidationFieldError if the filter is not compressed', () => {
    const tradeSourceIds = []
    for (let i = 0; i < MAX_TRADE_SOURCE_IDS + 1; i++) {
      tradeSourceIds.push(i)
    }

    const filter = JSON.stringify({ tradeSourceIds })

    try {
      parseFilter(logger, filter)
      fail('Expected failure')
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationFieldError)
      expect(error.validationErrors).toEqual({
        filter: {
          tradeSourceIds: [`Invalid filter. Failed when decompressing and parsing filter`]
        }
      })
    }
  })
})
