import { Schema } from 'mongoose'

import { FEEDBACK_STATUS } from '../../../business-layer/messaging/enums'
import { enumValues } from '../../../utils'
import { Model } from '../models'

export const DocumentReviewSchema: Schema = new Schema(
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
    reviewerId: {
      type: String
    }
  },
  {
    _id: false
  }
)
