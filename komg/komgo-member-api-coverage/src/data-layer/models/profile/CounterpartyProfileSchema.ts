import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'
import { enumValues } from '../../../utils/utils'
import { RiskLevel } from './enums'

/**
 * MongooseSchema
 * @type {"mongoose".Schema}
 * @private
 */
const CounterpartyProfileSchema: Schema = new Schema({
  _id: {
    type: String,
    default: uuid4,
    required: true,
    alias: 'id'
  },
  counterpartyId: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    index: {
      unique: true,
      dropDups: true
    }
  },
  riskLevel: {
    type: String,
    trim: true,
    enum: enumValues(RiskLevel),
    required: false
  },
  renewalDate: {
    type: Date,
    required: false
  },
  managedById: {
    type: String,
    trim: true,
    required: false
  }
})

// Unique name per counterparty
CounterpartyProfileSchema.index({ counterpartyId: 1 }, { unique: 1 })

export { CounterpartyProfileSchema }
