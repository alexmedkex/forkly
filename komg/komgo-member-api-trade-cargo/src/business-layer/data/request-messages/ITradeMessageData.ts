import { IMessageData } from './IMessageData'

export interface ITradeMessageData extends IMessageData {
  buyer?: string
  buyerEtrmId?: string
  seller?: string
  sellerEtrmId?: string
  dealDate?: string | number
  deliveryPeriod?: {
    startDate: string | number
    endDate: string | number
  }
  paymentTerms?: {
    eventBase: string
    when: string
    time: number
    timeUnit: string
    dayType: string
  }
  price?: number
  currency?: string
  priceUnit?: string
  quantity?: number
  deliveryTerms?: string
  minTolerance?: number
  maxTolerance?: number
  invoiceQuantity?: string
  generalTermsAndConditions?: string
  laytime?: string
  demurrageTerms?: string
  law?: string
  requiredDocuments?: string[]
  creditRequirement?: string
}
