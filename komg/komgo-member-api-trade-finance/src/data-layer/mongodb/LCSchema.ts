import { Schema } from 'mongoose'
import TradeAndCargoSnapshotSchema from './TradeAndCargoSnapshotSchema'
import { StateTransitionSchema } from './StateTransitionSchema'
import { TimerSchema } from './TimerSchema'

export const LCSchema: Schema = new Schema(
  {
    applicantId: {
      type: String,
      required: true
    },
    applicantContactPerson: {
      type: String,
      required: false
    },
    beneficiaryId: {
      type: String,
      required: true
    },
    beneficiaryContactPerson: {
      type: String,
      required: false
    },
    issuingBankId: {
      type: String,
      required: true
    },
    issuingBankContactPerson: {
      type: String,
      required: false
    },
    direct: {
      type: Boolean,
      required: true
    },
    beneficiaryBankId: {
      type: String,
      required: false
    },
    beneficiaryBankContactPerson: {
      type: String,
      required: false
    },
    beneficiaryBankRole: {
      type: String,
      required: false
    },
    tradeAndCargoSnapshot: {
      type: TradeAndCargoSnapshotSchema,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    applicableRules: {
      type: String,
      required: false
    },
    feesPayableBy: {
      type: String,
      required: true
    },
    feesPayableByOther: {
      type: String,
      required: false
    },
    currency: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    expiryDate: {
      type: String,
      required: true
    },
    expiryPlace: {
      type: String,
      required: true
    },
    availableWith: {
      type: String,
      required: true
    },
    availableBy: {
      type: String,
      required: true
    },
    partialShipmentAllowed: {
      type: Boolean,
      required: true,
      default: true
    },
    transhipmentAllowed: {
      type: Boolean,
      required: true,
      default: false
    },
    documentPresentationDeadlineDays: {
      type: Number,
      required: true
    },
    comments: {
      type: String,
      required: false
    },
    reference: {
      type: String,
      required: true,
      unique: true
    },
    referenceObject: {
      type: Object,
      required: true
    },
    issuingBankReference: {
      type: String,
      required: false
    },
    status: {
      type: String,
      required: true
    },
    transactionHash: {
      type: String
    },
    contractAddress: {
      type: String
    },
    issuingBankComments: {
      type: String,
      required: false
    },
    advisingBankComments: {
      type: String,
      required: false
    },
    beneficiaryComments: {
      type: String,
      required: false
    },
    billOfLadingEndorsement: {
      type: String,
      required: false
    },
    invoiceRequirement: {
      type: String,
      required: false
    },
    commercialContractDocumentHash: {
      type: String,
      required: false
    },
    draftLCDocumentHash: {
      type: String,
      required: false // Temporary, this should be made mandatory with Bo changes (change to True)
    },
    templateType: {
      type: String,
      required: false
    },
    freeTextLc: {
      type: String,
      required: false
    },
    stateHistory: [
      {
        type: StateTransitionSchema
      }
    ],
    LOI: {
      type: String,
      required: false
    },
    LOIAllowed: {
      type: Boolean,
      required: false
    },
    LOIType: {
      type: String,
      required: false
    },
    destinationState: {
      type: String,
      required: false
    },
    nonce: {
      type: Number,
      required: true
    },
    issueDueDate: {
      type: TimerSchema,
      required: false
    }
  },
  { timestamps: true }
)
