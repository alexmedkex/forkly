import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { Readable } from 'stream'

import { ErrorName } from '../../utils/ErrorName'
import { MONGODB_DUPLICATE_ERROR } from '../consts'

import DuplicatedItem from './exceptions/DuplicatedItem'

const Duplex = require('stream').Duplex

const logger = getLogger('data-agent-utils')

/**
 * Process errors that can arise from a record creation/update
 *
 * @param promise promise for a record creation/update
 * @throws InvalidItem if an item that was suppose to be created/updated was invalid
 */
export async function handleRecordUpsert<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise
  } catch (error) {
    logger.error(ErrorCode.DatabaseInvalidData, ErrorName.MongoUpsertError, 'Mongo operation failed', {
      errorMessage: error.message || error.errmsg,
      stacktrace: error.stack,
      mongoErrorCode: error.code
    })
    if (error.code === MONGODB_DUPLICATE_ERROR) {
      throw new DuplicatedItem(error.message)
    }
    throw error
  }
}

/**
 * Converts a buffer to stream for the purpose of saving to GridFs
 *
 * @param buffer
 */
export function bufferToStream(buffer: Buffer): Readable {
  const stream = new Duplex()
  stream.push(buffer)
  stream.push(null)
  return stream
}
