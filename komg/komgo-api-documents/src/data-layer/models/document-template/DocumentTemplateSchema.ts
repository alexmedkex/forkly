import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { DEFAULT_SCHEMA_CONFIG } from '../../consts'
import { KeyValueSchema } from '../KeyValueSchema'

import { DocumentTemplateContentSchema } from './DocumentTemplateContentSchema'

/**
 * MongooseSchema
 * @type {"mongoose".Schema}
 * @private
 */
export const DocumentTemplateSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuid4,
      required: true,
      alias: 'id'
    },
    metadata: [KeyValueSchema],
    content: DocumentTemplateContentSchema
  },
  DEFAULT_SCHEMA_CONFIG
)
