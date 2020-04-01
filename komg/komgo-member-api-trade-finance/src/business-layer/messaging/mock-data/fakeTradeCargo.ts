import { TradeSource } from '@komgo/types'

import { ITradeAndCargoSnapshot } from '../../../data-layer/models/ITradeAndCargoSnapshot'

export const fakeTrade = ({ buyerEtrmId = '95267', vaktId = '49000', status = 'test' } = {}) => ({
  ...sampleTrade,
  buyerEtrmId,
  sourceId: vaktId,
  status
})

export const fakeCargo = ({ vaktId = '49000', status = 'test' } = {}) => ({
  ...sampleCargos[0],
  sourceId: vaktId,
  status
})

export const fakeTradeAndCargoSnapshot = ({
  source = TradeSource.Komgo,
  sourceId = 'source',
  trade = fakeTrade(),
  cargo = fakeCargo()
} = {}): ITradeAndCargoSnapshot => ({
  source,
  sourceId,
  trade,
  cargo
})

export const sampleTrade = {
  source: 'VAKT',
  status: 'test',
  messageType: 'KOMGO.Trade.TradeData',
  sellerEtrmId: '49779',
  buyerEtrmId: '95267',
  vaktId: '49000',
  seller: 'a3d82ae6-908c-49da-95b3-ba1ebe7e5f85',
  buyer: '08e9f8e3-94e5-459e-8458-ab512bee6e2c',
  dealDate: '2018-10-25',
  currency: 'USD',
  price: 73.1415,
  priceUnit: 'BBL',
  quantity: 600000,
  deliveryTerms: 'FOB',
  deliveryPeriod: {
    startDate: '2018-10-01',
    endDate: '2018-10-31'
  },
  pricingTerms: null,
  paymentTerms: {
    eventBase: 'BL',
    when: 'FROM',
    time: 30,
    timeUnit: 'DAYS',
    dayType: 'CALENDAR'
  },
  inspection: null,
  credit: 'DOCUMENTARY_LETTER_OF_CREDIT',
  laytime: 'as per GT&Cs',
  invoiceQuantity: 'load',
  demurrageTerms: 'as per GT&Cs',
  generalTermsAndConditions: 'SUKO90',
  law: 'ENGLISH_LAW',
  maxTolerance: 1,
  minTolerance: 1,
  requiredDocuments: [
    'BILL_OF_LADING',
    'CERTIFICATE_OF_ORIGIN',
    'QUALITY_AND_QUANTITY_REPORT',
    'CERTIFICATE_OF_INSURANCE'
  ],
  isLCCancelled: false
}

export const sampleCargos = [
  {
    source: 'VAKT',
    vaktId: '49000',
    cargoId: '5555aaaaaa',
    grade: 'A1',
    status: 'test',
    parcels: [
      {
        id: 'idparcel1',
        laycanPeriod: { startDate: new Date('2018-09-01'), endDate: new Date('2018-09-30') },
        vesselIMO: 1,
        vesselName: 'Andrej',
        loadingPort: 'Banja luka',
        dischargeArea: 'Sarajevo',
        inspector: 'Kenan',
        deemedBLDate: new Date('2018-09-01'),
        quantity: 3
      }
    ]
  }
]

export const withSourceIdOnly = tradeOrCargo => {
  const result = {
    ...tradeOrCargo,
    sourceId: tradeOrCargo.vaktId
  }
  delete result.vaktId
  return result
}
