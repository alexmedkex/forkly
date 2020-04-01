import { Schema } from 'mongoose'
import { StateTransitionSchema } from './StateTransitionSchema'
import { LCPresentationDocumentSchema } from './LCPresentationDocumentSchema'
import { LCPresentationStatus } from '@komgo/types'
import { ContractReferenceSchema } from './ContractReferenceSchema'

export const LCPresentationSchema: Schema = new Schema(
  {
    staticId: {
      type: String,
      required: true
    },
    beneficiaryId: {
      type: String,
      required: true
    },
    applicantId: {
      type: String,
      required: true
    },
    issuingBankId: {
      type: String,
      required: true
    },
    nominatedBankId: {
      type: String
    },
    reference: {
      type: String,
      required: true
    },
    LCReference: {
      type: String,
      required: true
    },
    documents: [
      {
        type: LCPresentationDocumentSchema
      }
    ],
    submittedAt: {
      type: Date
    },
    beneficiaryComments: {
      type: String,
      required: false
    },
    nominatedBankComments: {
      type: String,
      required: false
    },
    issuingBankComments: {
      type: String,
      required: false
    },
    applicantComments: {
      type: String,
      required: false
    },
    status: {
      type: String,
      enum: Object.values(LCPresentationStatus),
      required: true
    },
    stateHistory: [
      {
        type: StateTransitionSchema
      }
    ],
    contracts: [
      {
        type: ContractReferenceSchema
      }
    ],
    destinationState: {
      type: String,
      enum: Object.values(LCPresentationStatus),
      required: false
    },
    deletedAt: {
      type: Date
    }
  },
  { timestamps: true }
)
