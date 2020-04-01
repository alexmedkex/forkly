import { DepositLoanPeriod, Currency } from '@komgo/types'
import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { DEFAULT_SCHEMA_CONFIG } from '../utils/consts'

const DepositLoanRequestSchema: Schema = new Schema(
  {
    staticId: {
      type: String,
      default: uuid4
    },
    companyStaticId: {
      type: String,
      required: true
    },
    requestType: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    currency: {
      type: Currency,
      required: true
    },
    period: {
      type: DepositLoanPeriod,
      required: true
    },
    periodDuration: {
      type: Number,
      required: false,
      default: null
    },
    comment: {
      type: String,
      required: false
    },
    status: {
      type: String,
      required: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    deletedAt: {
      type: Date,
      required: false,
      default: null
    }
  },
  { DEFAULT_SCHEMA_CONFIG }
)

export default DepositLoanRequestSchema
