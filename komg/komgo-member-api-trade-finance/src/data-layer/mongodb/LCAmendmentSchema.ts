import { Schema } from 'mongoose'
import { LCAmendmentStatus } from '@komgo/types'
import { DiffSchema } from './DiffSchema'

export const StateSchema: Schema = new Schema({
  fromState: {
    type: String
  },
  toState: {
    type: String
  },
  performer: {
    type: String
  },
  date: {
    type: String
  }
})

export const LCAmendmentDocumentSchema: Schema = new Schema({
  documentId: {
    type: String,
    required: true
  },
  documentHash: {
    type: String,
    required: true
  }
})

export const LCAmendmentSchema: Schema = new Schema(
  {
    staticId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(LCAmendmentStatus)
    },
    lcReference: {
      type: String,
      required: true
    },
    lcStaticId: {
      type: String,
      required: true
    },
    diffs: {
      type: [DiffSchema]
    },
    transactionHash: {
      type: String
    },
    contractAddress: {
      type: String
    },
    comment: {
      type: String
    },
    stateHistory: {
      type: [StateSchema]
    },
    documents: {
      type: [LCAmendmentDocumentSchema]
    }
  },
  { timestamps: true }
)
