import { CreditRequirements } from '@komgo/types'

const tradeMessage = {
  version: 1,
  messageType: 'KOMGO.Trade.TradeData',
  vaktId: 'E2389423',
  buyer: '49000',
  buyerEtrmId: 'G2389423',
  seller: 'SHELL_BFOET-123',
  sellerEtrmId: '',
  dealDate: '2018-12-31',
  deliveryPeriod: {
    startDate: '2018-12-31',
    endDate: '2018-12-31'
  },
  paymentTerms: {
    eventBase: 'BL',
    when: 'AFTER',
    time: 30,
    timeUnit: 'DAYS',
    dayType: 'CALENDAR'
  },
  price: 170.02,
  currency: 'USD',
  priceUnit: 'BBL',
  quantity: 20000,
  deliveryTerms: 'FOB',
  minTolerance: 1.77,
  maxTolerance: 1.77,
  invoiceQuantity: 'load',
  generalTermsAndConditions: 'suko90',
  laytime: 'as per GT&Cs',
  demurrageTerms: `as per GT&C's`,
  law: 'English Law',
  requiredDocuments: ['Q88'],
  deliveryLocation: 'Stansted',
  creditRequirement: CreditRequirements.DocumentaryLetterOfCredit
}

export { tradeMessage }
