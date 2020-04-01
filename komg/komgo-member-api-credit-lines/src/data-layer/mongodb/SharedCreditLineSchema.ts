import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { DEFAULT_SCHEMA_CONFIG } from '../utils/consts'

const InformationSharedSchema: Schema = new Schema(
  {
    appetite: {
      shared: {
        type: Boolean,
        required: true
      },
      required: false
    },
    availability: {
      shared: {
        type: Boolean,
        required: false
      },
      required: false
    },
    availabilityAmount: {
      shared: {
        type: Boolean,
        required: false
      },
      required: false
    },
    creditLimit: {
      shared: {
        type: Boolean,
        required: false
      },
      required: false
    }
  },
  {
    strict: false
  }
)

const SharedCreditLineSchema: Schema = new Schema(
  {
    staticId: {
      type: String,
      required: true,
      default: uuid4
    },
    counterpartyStaticId: {
      type: String,
      required: true
    },
    sharedWithStaticId: {
      type: String,
      required: true
    },
    creditLineStaticId: {
      type: String,
      required: true
    },
    data: {
      type: InformationSharedSchema,
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

export default SharedCreditLineSchema
