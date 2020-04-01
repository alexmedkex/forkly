import { PricingType, InterestType, Currency, LiborType, FeeCalculationType } from '@komgo/types'
import { Schema } from 'mongoose'

const MonetaryAmountSchema: Schema = new Schema(
  {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      enum: Object.values(Currency),
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

const IQuoteSchema: Schema = new Schema(
  {
    staticId: {
      type: String,
      required: true,
      index: true
    },
    advanceRate: {
      type: Number,
      required: true
    },
    pricingType: {
      type: String,
      enum: Object.values(PricingType),
      required: true
    },
    pricingAllIn: {
      type: Number
    },
    pricingFlatFeeAmount: {
      type: MonetaryAmountSchema
    },
    pricingRiskFee: {
      type: Number
    },
    pricingMargin: {
      type: Number
    },
    numberOfDaysRiskCover: {
      type: Number
    },
    numberOfDaysDiscounting: {
      type: Number
    },
    interestType: {
      type: String,
      enum: Object.values(InterestType)
    },
    indicativeCof: {
      type: Number
    },
    addOnValue: {
      type: Number
    },
    liborType: {
      type: String,
      enum: Object.values(LiborType)
    },
    daysUntilMaturity: {
      type: Number
    },
    feeCalculationType: {
      type: String,
      enum: Object.values(FeeCalculationType)
    },
    otherFeeCalculationAmount: {
      type: MonetaryAmountSchema
    },
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

export default IQuoteSchema
