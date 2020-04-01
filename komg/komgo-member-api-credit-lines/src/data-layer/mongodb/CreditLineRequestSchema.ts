import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { DEFAULT_SCHEMA_CONFIG } from '../utils/consts'

const CreditLineRequestSchema: Schema = new Schema(
  {
    staticId: {
      type: String,
      default: uuid4
    },
    companyStaticId: {
      type: String,
      required: true
    },
    counterpartyStaticId: {
      type: String,
      required: true
    },
    requestType: {
      type: String,
      required: true
    },
    context: {
      type: Object,
      required: false
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

export default CreditLineRequestSchema
