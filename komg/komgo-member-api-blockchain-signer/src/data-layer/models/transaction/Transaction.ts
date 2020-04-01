import DataAccess from '@komgo/data-access'
import { getLogger } from '@komgo/logging'
import mongoose from 'mongoose'

import { ACTIONS, ErrorName } from '../../../middleware/common/Constants'

import { ITransaction } from './ITransaction'
import { TransactionSchema } from './TransactionSchema'
import { ErrorCode } from '@komgo/error-utilities'

interface ITransactionModel extends ITransaction, mongoose.Document {
  id: string
}

export type TransactionModel = mongoose.Model<ITransactionModel>

const Transaction: TransactionModel = DataAccess.connection.model<ITransactionModel>('Transaction', TransactionSchema)

Transaction.on('index', (error: any) => {
  const logger = getLogger('TransactionModel')
  const model = 'Transaction'

  if (error) {
    logger.error(ErrorCode.DatabaseInvalidData, ErrorName.DatabaseBuildIndexFailed, 'Failed to build indexes', {
      action: ACTIONS.BUILD_INDEX,
      message: error.message,
      model
    })
  } else {
    logger.info('Successfully built indexes', { model })
  }
})

export { Transaction }
