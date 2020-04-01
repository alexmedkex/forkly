import { LogstashCapableLogger } from '@komgo/logging'
import { createMockInstance } from 'jest-create-mock-instance'

import { InvalidAddressError } from '../errors'

import { checkAddress } from './checkAddress'
import { checksumAddress } from './checksumAddress'

const ADDRESS = '0xa0c2bae464ef41e9457a69d5e125be64d07fa905'

describe('checkAddress', () => {
  let logger: jest.Mocked<LogstashCapableLogger>

  beforeAll(() => {
    logger = createMockInstance(LogstashCapableLogger)
    logger.error = jest.fn()
  })

  it('should return true if address is valid', () => {
    const result = checkAddress(ADDRESS, logger)
    expect(result).toEqual(true)
  })

  it('should return true if checksum address is valid', () => {
    const result = checkAddress(checksumAddress(ADDRESS), logger)
    expect(result).toEqual(true)
  })

  it('should throw an InvalidAddressError if the address is invalid', () => {
    try {
      checkAddress('notAnAddress', logger)
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidAddressError)
      expect(logger.error).toHaveBeenCalled()
    }
  })
})
