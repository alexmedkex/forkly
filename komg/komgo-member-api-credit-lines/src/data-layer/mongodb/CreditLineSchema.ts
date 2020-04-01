import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { DEFAULT_SCHEMA_CONFIG } from '../utils/consts'

const CreditLineSchema: Schema = new Schema(
  {
    staticId: {
      type: String,
      default: uuid4
    },
    counterpartyStaticId: {
      type: String,
      required: false
    },
    context: {
      type: Object,
      required: false
    },
    appetite: {
      type: Boolean,
      required: false
    },
    creditLimit: {
      type: Number,
      required: false
    },
    availability: {
      type: Boolean,
      required: false
    },
    availabilityAmount: {
      type: Number,
      required: false
    },
    availabilityAmountUpdatedAt: {
      type: Date,
      required: false
    },
    creditExpiryDate: {
      type: Date,
      required: false
    },
    currency: {
      type: String,
      required: false
    },
    data: {
      type: Object,
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

export default CreditLineSchema
