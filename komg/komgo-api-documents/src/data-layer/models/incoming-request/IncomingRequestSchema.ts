import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { DEFAULT_SCHEMA_CONFIG } from '../../consts'
import { Model } from '../models'
import { DismissTypeSchema } from '../requests/DismissTypeSchema'
import { NoteSchema } from '../requests/NoteSchema'

export const IncomingRequestSchema: Schema = new Schema(
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
    documents: [
      {
        type: String,
        required: false,
        ref: Model.Document
      }
    ],
    sentDocumentTypes: [{ type: String }],
    sentDocuments: [{ type: String }],
    dismissedTypes: [DismissTypeSchema],
    notes: [NoteSchema],
    deadline: {
      type: Date,
      required: false
    }
  },
  DEFAULT_SCHEMA_CONFIG
)
