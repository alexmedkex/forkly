import {
  CreditRequirements,
  ITrade,
  TradeSource,
  Currency,
  DeliveryTerms,
  InvoiceQuantity,
  Law,
  PaymentTermsEventBase,
  PaymentTermsWhen,
  PaymentTermsTimeUnit,
  PaymentTermsDayType,
  PriceUnit,
  TRADE_SCHEMA_VERSION,
  PaymentTermsOption,
  PriceOption,
  TradingRole
} from '@komgo/types'
import { LOC_STATUS } from '../constants/LetterOfCreditStatus'
import { ReceivableDiscountStatus } from '../constants/ReceivableDiscountStatus'
import { getTradingRole } from '../../business-layer/validation/utils'

export class Trade implements ITrade {
  source: TradeSource
  sourceId: string
  commodity?: string
  seller: string
  sellerEtrmId?: string
  buyer: string
  buyerEtrmId?: string
  currency: Currency
  dealDate: string | number | Date
  deliveryPeriod: { startDate: string | number | Date; endDate: string | number | Date }
  deliveryTerms: DeliveryTerms | string
  demurrageTerms: string
  generalTermsAndConditions: string
  invoiceQuantity: InvoiceQuantity
  version: TRADE_SCHEMA_VERSION
  deliveryLocation: string
  paymentTermsOption: PaymentTermsOption
  law: Law | string
  laytime: string
  paymentTerms: {
    eventBase: PaymentTermsEventBase
    when: PaymentTermsWhen
    time: number
    timeUnit: PaymentTermsTimeUnit
    dayType: PaymentTermsDayType
  }
  price: number
  priceUnit: PriceUnit
  quantity: number
  minTolerance: number
  maxTolerance: number
  status: string
  requiredDocuments?: string[]
  creditRequirement: CreditRequirements
  contractReference?: string
  contractDate?: string | number | Date
  priceFormula: string
  priceOption: PriceOption
  createdAt: string
  updatedAt: string
  deletedAt?: string
  // tslint:disable-next-line
  _id: string

  constructor(source: TradeSource, sourceId: string, companyStaticId: string, options: Partial<ITrade> = {}) {
    const {
      minTolerance,
      maxTolerance,
      commodity,
      seller,
      sellerEtrmId,
      buyer,
      buyerEtrmId,
      quantity,
      priceUnit,
      price,
      laytime,
      law,
      invoiceQuantity,
      generalTermsAndConditions,
      demurrageTerms,
      deliveryTerms,
      dealDate,
      currency,
      requiredDocuments,
      creditRequirement,
      paymentTermsOption,
      deliveryLocation,
      priceFormula,
      priceOption,
      contractReference,
      contractDate,
      createdAt,
      updatedAt,
      deletedAt,
      version,
      _id
    } = options

    const paymentTerms: any = options.paymentTerms || {}
    const deliveryPeriod: any = options.deliveryPeriod || {}
    this.source = source
    this.sourceId = sourceId
    this.commodity = commodity
    this.status = this.getStatus(buyer, seller, companyStaticId)
    this.minTolerance = minTolerance
    this.maxTolerance = maxTolerance
    this.seller = seller
    this.sellerEtrmId = sellerEtrmId
    this.buyer = buyer
    this.buyerEtrmId = buyerEtrmId
    this.quantity = quantity
    this.priceUnit = priceUnit
    this.price = price
    this.paymentTerms = {
      eventBase: paymentTerms.eventBase,
      when: paymentTerms.when,
      time: paymentTerms.time,
      timeUnit: paymentTerms.timeUnit,
      dayType: paymentTerms.dayType
    }
    this.laytime = laytime
    this.law = law
    this.invoiceQuantity = invoiceQuantity
    this.generalTermsAndConditions = generalTermsAndConditions
    this.demurrageTerms = demurrageTerms
    this.deliveryTerms = deliveryTerms
    this.deliveryPeriod = {
      startDate: deliveryPeriod.startDate,
      endDate: deliveryPeriod.endDate
    }
    this.dealDate = dealDate
    this.currency = currency
    this.requiredDocuments = requiredDocuments
    this.creditRequirement = creditRequirement
    this.version = version
    this.createdAt = createdAt
    this.deletedAt = deletedAt
    this.updatedAt = updatedAt
    this.paymentTermsOption = paymentTermsOption
    this.deliveryLocation = deliveryLocation
    this.priceFormula = priceFormula
    this.priceOption = priceOption
    this.contractReference = contractReference
    this.contractDate = contractDate
    this._id = _id
  }

  private getStatus(buyer: string, seller: string, companyStaticId: string) {
    return getTradingRole(buyer, seller, companyStaticId) === TradingRole.Sale
      ? ReceivableDiscountStatus.ToBeDiscounted
      : LOC_STATUS.TO_BE_FINANCED
  }
}
