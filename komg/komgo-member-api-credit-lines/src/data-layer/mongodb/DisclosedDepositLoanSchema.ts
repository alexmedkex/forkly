import { DepositLoanType, DepositLoanPeriod } from '@komgo/types'
import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

const DisclosedDepositLoanSchema: Schema = new Schema(
  {
    staticId: {
      type: String,
      default: uuid4
    },
    ownerStaticId: {
      type: String,
      required: true
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
  { timestamps: true }
)

export default DisclosedDepositLoanSchema
