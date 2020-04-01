import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { enumValues } from '../../../utils'
import { DEFAULT_SCHEMA_CONFIG } from '../../consts'
import { DocumentState } from '../ActionStates'
import { KeyValueSchema } from '../KeyValueSchema'
import { Model } from '../models'

import { ContentSchema } from './ContentSchema'
import { DownloadInfoSchema } from './DownloadInfoSchema'
import { OwnerSchema } from './OwnerSchema'
import { SharedWithSchema } from './SharedWithSchema'
import { UnsignedContentSchema } from './UnsignedContentSchema'
import { UploadInfoSchema } from './UploadInfoSchema'

/**
 * MongooseSchema
 * @type {"mongoose".Schema}
 * @private
 */
export const DocumentSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuid4,
      required: true,
      alias: 'id'
    },
    context: {
      type: Object,
      required: false
    },
    productId: {
      type: String,
      required: true,
      alias: 'product',
      ref: Model.Product
    },
    name: {
      type: String,
      required: true
    },
    categoryId: {
      type: String,
      required: true,
      alias: 'category',
      ref: Model.Category
    },
    typeId: {
      type: String,
      required: true,
      alias: 'type',
      ref: Model.Type
    },
    owner: OwnerSchema,
    metadata: [KeyValueSchema],
    hash: {
      type: String,
      required: true
    },
    contentHash: {
      type: String,
      required: false
    },
    komgoStamp: {
      type: Boolean,
      default: false
    },
    registrationDate: {
      type: Date,
      required: true
    },
    content: ContentSchema,
    contentPreview: {
      type: UnsignedContentSchema,
      required: false
    },
    sharedWith: {
      type: [SharedWithSchema],
      default: [],
      required: true
    },
    sharedBy: {
      type: String,
      required: false
    },
    comment: {
      type: String,
      required: false
    },
    state: {
      type: String,
      enum: enumValues(DocumentState),
      required: true
    },
    uploadInfo: {
      type: UploadInfoSchema,
      required: false
    },
    downloadInfo: {
      type: DownloadInfoSchema,
      required: false
    }
  },
  DEFAULT_SCHEMA_CONFIG
)

// Unique name per product
DocumentSchema.index({ productId: 1, name: 1, sharedBy: 1 }, { unique: 1 })
