import { CreditRequirements } from '@komgo/types'
import { SOURCES } from '../../src/data-layer/constants/Sources'

const trade = {
  source: SOURCES.KOMGO,
  vaktId: 'V93726453',
  sellerEtrmId: '123456789',
  buyer: '49000',
  seller: 'company-123',
  dealDate: '2017-12-31',
  deliveryPeriod: {
    startDate: '2017-12-31',
    endDate: '2017-12-31'
  },
  paymentTerms: {
    eventBase: 'BL',
    when: 'AFTER',
    time: 30,
    timeUnit: 'DAYS',
    dayType: 'CALENDAR'
  },
  price: 70.02,
  currency: 'USD',
  priceUnit: 'BBL',
  quantity: 600000,
  deliveryTerms: 'FOB',
  minTolerance: 1.25,
  maxTolerance: 1.25,
  invoiceQuantity: 'LOAD',
  generalTermsAndConditions: 'suko90',
  law: 'English Law',
  requiredDocuments: ['Q88'],
  creditRequirement: CreditRequirements.DocumentaryLetterOfCredit,
  buyerEtrmId: 'buyEtrm',
  laytime: 'as per GT&Cs',
  demurrageTerms: "as per GT&C's"
}

export { trade }
