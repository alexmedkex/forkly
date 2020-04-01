import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { DEFAULT_SCHEMA_CONFIG } from '../utils/consts'

const SharedDepositLoanSchema: Schema = new Schema(
  {
    staticId: {
      type: String,
      required: true,
      default: uuid4
    },
    sharedWithStaticId: {
      type: String,
      required: true
    },
    depositLoanStaticId: {
      type: String,
      required: true
    },
    appetite: {
      shared: {
        type: Boolean,
        required: true
      },
      required: false
    },
    pricing: {
      shared: {
        type: Boolean,
        required: false
      },
      pricing: {
        type: Number,
        required: false
      },
      required: false
    },
    deletedAt: {
      type: Date,
      required: false,
      default: null
    }
  },
  { timestamps: true }
)

export default SharedDepositLoanSchema
