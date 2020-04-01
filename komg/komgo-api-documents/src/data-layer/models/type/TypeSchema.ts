import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { DEFAULT_SCHEMA_CONFIG } from '../../consts'
import { Model } from '../models'

import { TypeFieldSchema } from './TypeFieldSchema'

/**
 * MongooseSchema
 * @type {"mongoose".Schema}
 * @private
 */
const TypeSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuid4,
      alias: 'id'
    },
    productId: {
      type: String,
      required: true,
      index: true,
      alias: 'product',
      ref: Model.Product
    },
    categoryId: {
      type: String,
      required: true,
      index: true,
      alias: 'category',
      ref: Model.Category
    },
    name: {
      type: String,
      required: true
    },
    vaktId: {
      type: String,
      required: false
    },
    fields: [TypeFieldSchema],
    predefined: {
      type: Boolean,
      required: true
    }
  },
  DEFAULT_SCHEMA_CONFIG
)

TypeSchema.index({ productId: 1, categoryId: 1 })
TypeSchema.index({ productId: 1, _id: 1 })

// Unique name per category
TypeSchema.index({ categoryId: 1, name: 1 }, { unique: 1 })

export { TypeSchema }
