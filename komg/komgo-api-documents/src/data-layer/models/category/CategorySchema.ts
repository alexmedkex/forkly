import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { DEFAULT_SCHEMA_CONFIG } from '../../consts'
import { Model } from '../models'

/**
 * MongooseSchema
 * @type {"mongoose".Schema}
 * @private
 */
const CategorySchema: Schema = new Schema(
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
    name: {
      type: String,
      trim: true,
      required: true,
      index: {
        unique: true,
        dropDups: true
      }
    }
  },
  DEFAULT_SCHEMA_CONFIG
)

// Enforce unique name per product
CategorySchema.index({ productId: 1, name: 1 }, { unique: true })

export { CategorySchema }
