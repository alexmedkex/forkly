import { ErrorCode } from '@komgo/error-utilities'
import { LogstashCapableLogger } from '@komgo/logging'
import { IValidationErrors } from '@komgo/types'
import { decompressFromEncodedURIComponent } from 'lz-string'

import { ValidationFieldError } from '../../../business-layer/errors'
import { IRDFilter } from '../../../business-layer/types'
import { ErrorName } from '../../../ErrorName'

export const MAX_TRADE_SOURCE_IDS = 200

/**
 * Takes a filter as a string, transforms it into an object and validates it
 *
 * @param filter filter string to parse and validate
 * @throws ValidationFieldError if filter is non conforming
 */
export const parseFilter = (logger: LogstashCapableLogger, filter: string): IRDFilter => {
  let parsedFilter = null
  if (filter) {
    parsedFilter = JSON.parse(decompressFromEncodedURIComponent(filter))
    if (parsedFilter === null) {
      const message = 'Invalid filter. Failed when decompressing and parsing filter'
      const validationErrors: IValidationErrors = {
        filter: {
          tradeSourceIds: [message]
        }
      }
      throw new ValidationFieldError(message, validationErrors)
    }
  }

  if (parsedFilter) {
    const tradeSourceIds = parsedFilter.tradeSourceIds

    if (!Array.isArray(tradeSourceIds)) {
      const errorMessage = 'filter tradeSourceIds is not an Array'
      const validationErrors: IValidationErrors = {
        filter: {
          tradeSourceIds: ['tradeSourceIds should be an array']
        }
      }
      logger.error(ErrorCode.ValidationHttpContent, ErrorName.RDFilterNotAnArray, errorMessage, validationErrors)
      throw new ValidationFieldError(errorMessage, validationErrors)
    }

    const arrLength = parsedFilter.tradeSourceIds.length
    if (arrLength > MAX_TRADE_SOURCE_IDS) {
      const errorMessage = `Too many trades provided - should be less than ${MAX_TRADE_SOURCE_IDS}`

      const validationErrors: IValidationErrors = {
        filter: {
          tradeSourceIds: [errorMessage]
        }
      }
      logger.error(ErrorCode.ValidationHttpContent, ErrorName.RDFilterTooBig, errorMessage, validationErrors)
      throw new ValidationFieldError(errorMessage, validationErrors)
    }

    return { tradeSourceIds }
  }

  return {}
}
