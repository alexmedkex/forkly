import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { DEFAULT_SCHEMA_CONFIG } from '../../consts'
import { Model } from '../models'
import { DismissTypeSchema } from '../requests/DismissTypeSchema'
import { NoteSchema } from '../requests/NoteSchema'

/**
 * MongooseSchema
 * @type {"mongoose".Schema}
 * @private
 */
export const OutgoingRequestSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuid4,
      alias: 'id'
    },
    productId: {
      type: String,
      required: true,
      alias: 'product',
      ref: Model.Product
    },
    companyId: {
      type: String,
      required: true
    },
    types: [
      {
        type: String,
        required: true,
        ref: Model.Type
      }
    ],
    forms: [
      {
        type: String,
        required: false,
        ref: Model.Document
      }
    ],
    dismissedTypes: [DismissTypeSchema],
    notes: [NoteSchema],
    deadline: {
      type: Date,
      required: false
    }
  },
  DEFAULT_SCHEMA_CONFIG
)

OutgoingRequestSchema.index({ productId: 1 })
OutgoingRequestSchema.index({ _id: 1, productId: 1 })
