import { Schema } from 'mongoose'

import { FEEDBACK_STATUS } from '../../../business-layer/messaging/enums'
import { enumValues } from '../../../utils'
import { Model } from '../models'

export const DocumentFeedbackSchema: Schema = new Schema(
  {
    documentId: {
      type: String,
      required: true,
      alias: 'document',
      ref: Model.Document
    },
    status: {
      type: String,
      required: true,
      enum: enumValues(FEEDBACK_STATUS)
    },
    note: {
      type: String
    },
    newVersionRequested: {
      type: Boolean,
      required: false
    }
  },
  {
    _id: false
  }
)
