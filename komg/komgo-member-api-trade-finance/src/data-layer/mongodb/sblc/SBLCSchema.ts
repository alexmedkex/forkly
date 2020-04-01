import { Schema } from 'mongoose'
import { StandbyLetterOfCreditStatus, DuplicateClause } from '@komgo/types'
import { TradeIdSchema } from './TradeIdSchema'
import { StateTransitionSchema } from '../StateTransitionSchema'

export const SBLCSchema: Schema = new Schema(
  {
    applicantId: {
      type: String,
      required: true
    },
    beneficiaryId: {
      type: String,
      required: true
    },
    issuingBankId: {
      type: String,
      required: true
    },
    advisingBankId: {
      type: String,
      required: false
    },
    tradeId: {
      type: TradeIdSchema,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    availableWith: {
      type: String
    },
    currency: {
      type: String,
      required: true
    },
    expiryDate: {
      type: String,
      required: true
    },
    feesPayableBy: {
      type: String,
      required: true
    },
    invoiceRequirement: {
      type: String,
      required: false
    },
    additionalInformation: {
      type: String,
      required: false
    },
    template: {
      type: String,
      required: false
    },
    reference: {
      type: String,
      required: false
    },
    extra: {
      type: String,
      required: false
    },
    nonce: {
      type: Number,
      required: false
    },
    staticId: {
      type: String,
      required: true
    },
    contractReference: {
      type: String,
      required: true
    },
    tradeSnapshot: {
      type: {},
      required: true
    },
    cargoSnapshot: {
      type: {}
    },
    duplicateClause: {
      type: String,
      enum: Object.values(DuplicateClause),
      required: true
    },
    status: {
      type: String,
      enum: Object.values(StandbyLetterOfCreditStatus)
    },
    stateHistory: [
      {
        type: StateTransitionSchema
      }
    ],
    documentHash: {
      type: String
    },
    issuingBankReference: {
      type: String
    },
    issuingBankPostalAddress: {
      type: String
    },
    transactionHash: {
      type: String
    },
    contractAddress: {
      type: String
    },
    overrideStandardTemplate: {
      type: String
    },
    contractDate: {
      type: Date
    }
  },
  { timestamps: true }
)
