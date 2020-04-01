import { TemplateOrigin } from '@komgo/types'
import { Schema } from 'mongoose'

import { DEFAULT_SCHEMA_CONFIG } from '../utils/constants'

export const TemplateSchema: Schema = new Schema(
  {
    staticId: {
      type: String,
      required: true
    },
    version: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    ownerCompanyStaticId: {
      type: String,
      required: true
    },
    templateBindingStaticId: {
      type: String,
      required: true
    },
    productId: {
      type: String,
      required: true
    },
    subProductId: {
      type: String,
      required: true
    },
    commodity: {
      type: String
    },
    revision: {
      type: Number,
      required: true
    },
    template: {
      type: {},
      required: true
    },
    origin: {
      type: String,
      enum: Object.values(TemplateOrigin),
      default: TemplateOrigin.Company,
      required: true
    },
    createdBy: {
      required: true,
      type: String
    },
    updatedBy: {
      type: String
    },
    deletedAt: {
      type: Date
    }
  },
  DEFAULT_SCHEMA_CONFIG
)
