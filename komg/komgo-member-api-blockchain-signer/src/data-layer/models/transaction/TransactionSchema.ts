import { Schema } from 'mongoose'
import { TransactionStatus } from './TransactionStatus'

/**
 * MongooseSchema
 * @type {"mongoose".Schema}
 * @private
 */
const TransactionSchema: Schema = new Schema({
  nonce: {
    type: Number,
    required: false
  },
  from: {
    type: String,
    required: true
  },
  body: {
    type: Object,
    required: true
  },
  hash: {
    type: String,
    required: false,
    index: { unique: true, partialFilterExpression: { hash: { $exists: true } } } // Ensures uniqueness and allows null values
  },
  status: {
    type: String,
    required: true,
    default: TransactionStatus.Pending,
    enum: [TransactionStatus.Pending, TransactionStatus.Confirmed, TransactionStatus.Failed, TransactionStatus.Reverted]
  },
  receipt: {
    type: Object,
    required: false
  },
  requestOrigin: {
    type: String,
    required: false
  },
  attempts: {
    type: Number,
    required: true,
    default: 0
  },
  context: {
    type: Object,
    required: false
  }
})

// Index to ensure uniqueness of nonce per account, allowing null values for nonce
TransactionSchema.index({ from: 1, nonce: -1 }, { unique: true, partialFilterExpression: { nonce: { $exists: true } } })
// Index to retrieve pending transactions more efficiently
TransactionSchema.index({ from: 1, status: 1 })

export { TransactionSchema }
