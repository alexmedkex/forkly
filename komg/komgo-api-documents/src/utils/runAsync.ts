import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'

import { ErrorName } from './ErrorName'

const logger = getLogger('runAsync')

/**
 * Runs asyncronous function and exits the process
 * Useful when we want to run async functions on a module level
 */
export const runAsyncAndExit = <T>(fn: () => Promise<T>) => {
  fn()
    .then(() => process.exit(0))
    .catch(e => {
      logger.error(ErrorCode.UnexpectedError, ErrorName.UnexpectedError, e.message, {
        stacktrace: e.stack
      })
      process.exit(1)
    })
}
