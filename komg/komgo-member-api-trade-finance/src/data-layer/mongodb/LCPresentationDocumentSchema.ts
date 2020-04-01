import { Schema } from 'mongoose'
import { LCPresentationDocumentStatus } from '@komgo/types'

export const LCPresentationDocumentSchema = new Schema(
  {
    documentId: {
      type: String,
      required: false
    },
    documentHash: {
      type: String,
      required: true
    },
    documentTypeId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(LCPresentationDocumentStatus),
      required: false
    },
    dateProvided: {
      type: Date
    }
  },
  { _id: false }
)
