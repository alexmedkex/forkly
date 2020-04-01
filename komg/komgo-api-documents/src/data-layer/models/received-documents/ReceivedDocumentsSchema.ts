import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { DEFAULT_SCHEMA_CONFIG } from '../../consts'
import { Model } from '../models'

import { DocumentReviewSchema } from './DocumentReviewSchema'

export const ReceivedDocumentsSchema: Schema = new Schema(
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
      ref: Model.OutgoingRequest
    },
    shareId: {
      type: String,
      required: false
    },
    documents: {
      type: [DocumentReviewSchema],
      required: true
    },
    feedbackSent: {
      type: Boolean,
      required: true
    }
  },
  DEFAULT_SCHEMA_CONFIG
)
