import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { Model, Document } from 'mongoose'

import { ErrorName } from '../../utils/ErrorName'

const logger = getLogger('models-utils')

export function logIndexCreation<T extends Document>(model: Model<T>) {
  model.on('index', function(err) {
    const collectionName = model.collection.name
    if (err) {
      logger.error(ErrorCode.DatabaseInvalidData, ErrorName.IndexCreationError, 'Failed to create index', {
        collectionName,
        errorMessage: err.message
      })
    } else {
      logger.info(`Done building indexes for collection '${collectionName}'`)
    }
  })
}
