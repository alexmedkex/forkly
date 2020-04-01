import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { DEFAULT_SCHEMA_CONFIG } from '../../consts'
import { Model } from '../models'

import { DocumentFeedbackSchema } from './DocumentFeedbackSchema'

export const SharedDocumentsSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuid4,
      alias: 'id'
    },
    context: {
      type: Object,
      required: false
    },
    productId: {
      type: String,
      required: true,
      index: true,
      alias: 'product',
      ref: Model.Product
    },
    companyId: {
      type: String,
      required: true
    },
    requestId: {
      type: String,
      required: false,
      alias: 'request',
      ref: Model.IncomingRequest
    },
    documents: {
      type: [DocumentFeedbackSchema],
      required: true
    },
    feedbackReceived: {
      type: Boolean,
      required: true
    }
  },
  DEFAULT_SCHEMA_CONFIG
)
