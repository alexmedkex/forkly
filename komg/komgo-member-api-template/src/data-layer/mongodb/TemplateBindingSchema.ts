import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { DEFAULT_SCHEMA_CONFIG } from '../utils/constants'

export const TemplateBindingSchema: Schema = new Schema(
  {
    staticId: {
      type: String,
      default: uuid4
    },
    productId: {
      type: String,
      required: true
    },
    subProductId: {
      type: String,
      required: true
    },
    dataSchemaId: {
      type: String,
      required: true
    },
    bindings: {
      type: {},
      required: true
    },
    templateSchemaId: {
      type: String,
      required: true
    },
    permissions: {
      type: {}
    },
    example: {
      type: {}
    },
    version: {
      type: Number,
      required: true
    }
  },
  DEFAULT_SCHEMA_CONFIG
)
