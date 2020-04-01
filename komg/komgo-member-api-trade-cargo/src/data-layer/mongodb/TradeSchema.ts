import { Schema } from 'mongoose'
import { TradeSource, PaymentTermsOption, PriceOption, TRADE_SCHEMA_VERSION, TradingRole } from '@komgo/types'
import { getTradingRole } from '../../business-layer/validation/utils/index'

/*
 * Trade validation is done in the TradeSchema.pre('validate'..) hook which executes before
 * a save
 */
const TradeSchema: Schema = new Schema(
  {
    source: {
      type: String,
      required: true
    },
    sourceId: {
      type: String,
      required: true
    },
    commodity: {
      type: String
    },
    status: {
      type: String,
      required: true
    },
    deliveryTerms: {
      type: String
    },
    buyer: {
      type: String, // is the member staticId
      required: true
    },
    buyerEtrmId: {
      type: String
    },
    seller: {
      type: String, // is the member staticId
      required: true
    },
    sellerEtrmId: {
      type: String
    },
    dealDate: {
      type: Date,
      required: true
    },
    deliveryPeriod: {
      startDate: Date,
      endDate: Date
    },
    paymentTerms: {
      eventBase: String,
      when: String,
      time: Number,
      timeUnit: String,
      dayType: String
    },
    price: {
      type: Number
    },
    currency: {
      type: String
    },
    priceUnit: {
      type: String
    },
    quantity: {
      type: Number
    },
    maxTolerance: {
      type: Number
    },
    minTolerance: {
      type: Number
    },
    invoiceQuantity: {
      type: String
    },
    generalTermsAndConditions: {
      type: String
    },
    laytime: {
      type: String
    },
    demurrageTerms: {
      type: String
    },
    law: {
      type: String
    },
    requiredDocuments: {
      type: [String]
    },
    creditRequirement: {
      type: String,
      required: true
    },
    paymentTermsOption: {
      type: String,
      enum: Object.values(PaymentTermsOption)
    },
    deliveryLocation: {
      type: String
    },
    priceOption: {
      type: String,
      enum: Object.values(PriceOption)
    },
    priceFormula: {
      type: String
    },
    contractReference: {
      type: String
    },
    contractDate: {
      type: Date
    },
    version: {
      type: Number,
      enum: Object.values(TRADE_SCHEMA_VERSION),
      default: TRADE_SCHEMA_VERSION.V1
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    deletedAt: {
      type: Date
    }
  },
  { timestamps: true }
)

TradeSchema.pre('validate', function(next) {
  if (this.source === TradeSource.Komgo) {
    if (getTradingRole(this.buyer, this.seller, process.env.COMPANY_STATIC_ID) === TradingRole.Sale) {
      validateSaleTrade(this)
    } else {
      validate(this)
    }
  }
  next()
})

function validateSaleTrade(context) {
  if (!context.sellerEtrmId) {
    context.invalidate(
      'sellerEtrmId',
      `sellerEtrmId should be set when your Trading Role for KOMGO source trades is ${TradingRole.Sale}`,
      context.sellerEtrmId
    )
  }
}

function validate(context) {
  if (!context.buyerEtrmId) {
    context.invalidate(
      'buyerEtrmId',
      `buyerEtrmId should be set when your Trading Role for KOMGO source trades is ${TradingRole.Purchase}`,
      context.buyerEtrmId
    )
  }
}
export default TradeSchema
