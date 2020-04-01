import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { DEFAULT_SCHEMA_CONFIG } from '../../consts'
import { KeyValueSchema } from '../KeyValueSchema'
import { Model } from '../models'

/**
 * MongooseSchema
 * @type {"mongoose".Schema}
 * @private
 */
const TemplateSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuid4,
      alias: 'id'
    },
    name: {
      type: String,
      required: true
    },
    productId: {
      type: String,
      required: true,
      alias: 'product',
      ref: Model.Product
    },
    types: [
      {
        type: String,
        required: true,
        ref: Model.Type
      }
    ],
    metadata: [KeyValueSchema]
  },
  DEFAULT_SCHEMA_CONFIG
)

TemplateSchema.index({ productId: 1 })
TemplateSchema.index({ _id: 1, productId: 1 })

// Unique name per product
TemplateSchema.index({ productId: 1, name: 1 }, { unique: 1 })

export { TemplateSchema }
