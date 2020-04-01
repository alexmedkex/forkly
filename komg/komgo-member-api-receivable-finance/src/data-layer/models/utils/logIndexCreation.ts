import { ErrorCode } from '@komgo/error-utilities'
import { LogstashCapableLogger } from '@komgo/logging'
import { Model, Document } from 'mongoose'

import { ErrorName } from '../../../ErrorName'

export function logIndexCreation<T extends Document>(logger: LogstashCapableLogger, model: Model<T>) {
  model.on('index', function(err) {
    const collectionName = model.collection.name
    if (err) {
      logger.error(ErrorCode.DatabaseInvalidData, ErrorName.BuildDatabaseIndex, 'Failed to create indexes', {
        collection: collectionName,
        error: err.message
      })
    } else {
      logger.info('Done building indexes', { collection: collectionName })
    }
  })
}
