import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'

import DuplicatedItem from '../../../data-layer/data-agents/exceptions/DuplicatedItem'
import { ErrorName } from '../../../utils/ErrorName'

const logger = getLogger('message-processors-utils')

export async function ignoreDuplicatedError<T>(senderStaticId: string, f: () => Promise<T>): Promise<T> {
  try {
    return await f()
  } catch (e) {
    if (e instanceof DuplicatedItem) {
      logger.warn(ErrorCode.DatabaseInvalidData, ErrorName.ItemDuplicatedError, 'Attempted to write a duplicate item', {
        senderStaticId,
        errorMessage: e.message,
        errorType: 'DuplicatedItem'
      })
    } else {
      throw e
    }
  }
}
