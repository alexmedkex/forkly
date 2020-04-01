import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { DEFAULT_SCHEMA_CONFIG } from '../../consts'

/**
 * MongooseSchema
 * @type {"mongoose".Schema}
 * @private
 */
export const ProductSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuid4,
      alias: 'id'
    },
    name: {
      type: String,
      required: true
    }
  },
  DEFAULT_SCHEMA_CONFIG
)
