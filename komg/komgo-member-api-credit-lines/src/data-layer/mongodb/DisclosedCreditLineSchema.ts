import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { DEFAULT_SCHEMA_CONFIG } from '../utils/consts'

const DisclosedCreditLineSchema: Schema = new Schema(
  {
    staticId: {
      type: String,
      required: true,
      default: uuid4
    },
    ownerStaticId: {
      type: String,
      required: true
    },
    counterpartyStaticId: {
      type: String,
      required: true
    },
    context: {
      type: Object,
      required: false
    },
    appetite: {
      type: Boolean,
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
    creditLimit: {
      type: Number,
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
  { timestamps: true }
)

export default DisclosedCreditLineSchema
