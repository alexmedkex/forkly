import { Currency, SupportingInstrument, RequestType, DiscountingType, FinancialInstrument } from '@komgo/types'
import { Schema } from 'mongoose'

const TradeReferenceSchema: Schema = new Schema(
  {
    sourceId: {
      type: String,
      required: true
    },
    sellerEtrmId: {
      type: String,
      required: true
    },
    source: {
      type: String,
      required: true
    }
  },
  {
    toObject: {
      transform(doc, ret) {
        delete ret._id
      }
    },
    toJSON: {
      transform(doc, ret) {
        delete ret._id
      }
    }
  }
)

const ReceivablesDiscountingSchema: Schema = new Schema(
  {
    staticId: {
      type: String,
      required: true,
      index: true
    },
    tradeReference: {
      type: TradeReferenceSchema,
      required: true
    },
    requestType: {
      type: String,
      enum: Object.values(RequestType),
      required: true
    },
    discountingType: {
      type: String,
      enum: Object.values(DiscountingType)
    },
    invoiceAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      enum: Object.values(Currency),
      required: true
    },
    invoiceType: {
      type: String,
      required: true
    },
    supportingInstruments: [
      {
        type: String,
        enum: Object.values(SupportingInstrument)
      }
    ],
    advancedRate: {
      type: Number,
      required: false
    },
    dateOfPerformance: {
      type: Date
    },
    discountingDate: {
      type: Date
    },
    riskCoverDate: {
      type: Date
    },
    numberOfDaysRiskCover: {
      type: Number
    },
    numberOfDaysDiscounting: {
      type: Number
    },
    financialInstrumentInfo: {
      type: {
        financialInstrument: {
          type: String,
          enum: Object.values(FinancialInstrument),
          required: true
        },
        financialInstrumentIssuerName: { type: String, required: true },
        financialInstrumentIfOther: { type: String }
      }
    },
    guarantor: { type: String },
    comment: {
      type: String
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    toObject: {
      transform(doc, ret) {
        delete ret._id
      }
    },
    toJSON: {
      transform(doc, ret) {
        delete ret._id
      }
    }
  }
)

TradeReferenceSchema.index({ sourceId: 1, sellerEtrmId: 1 })

export default ReceivablesDiscountingSchema
export { TradeReferenceSchema }
