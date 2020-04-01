import { DepositLoanType, DepositLoanPeriod } from '@komgo/types'
import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { DEFAULT_SCHEMA_CONFIG } from '../utils/consts'

const DepositLoanSchema: Schema = new Schema(
  {
    staticId: {
      type: String,
      default: uuid4
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(DepositLoanType)
    },
    appetite: {
      type: Boolean,
      required: false
    },
    currency: {
      type: String,
      required: false
    },
    pricing: {
      type: Number,
      required: false
    },
    pricingUpdatedAt: {
      type: Date,
      default: Date.now,
      required: false
    },
    periodDuration: {
      type: Number,
      required: false,
      default: null
    },
    period: {
      type: String,
      required: false,
      enum: Object.values(DepositLoanPeriod)
    },
    deletedAt: {
      type: Date,
      required: false,
      default: null
    }
  },
  { timestamps: true }
)

export default DepositLoanSchema
