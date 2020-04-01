import { ErrorCode } from '@komgo/error-utilities'
import { LogstashCapableLogger } from '@komgo/logging'
import { isAddress } from 'web3-utils'

import { ErrorName } from '../../../util/ErrorName'
import { InvalidAddressError } from '../errors'

export const checkAddress = (address: string, logger: LogstashCapableLogger) => {
  if (!isAddress(address)) {
    logger.error(ErrorCode.DatabaseInvalidData, ErrorName.InvalidAddress, 'Invalid address', { address })
    throw new InvalidAddressError('Invalid address', address)
  }

  return true
}
