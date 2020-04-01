import { formatTradeDate, formatEditTrade, formatDocuments, findMimeType, generateInitialFormData } from './formatters'
import { fakeTrade, fakeParcel } from '../../letter-of-credit-legacy/utils/faker'
import {
  ICargo,
  ITrade,
  buildFakeCargo as fakeCargo,
  buildFakeTrade,
  Commodity,
  PaymentTermsEventBase,
  DeliveryTerms,
  TRADE_SCHEMA_VERSION,
  buildFakeCargo,
  buildFakeParcel,
  ModeOfTransport
} from '@komgo/types'

import { initialCargoData, TradingRole, TRADING_ROLE_OPTIONS } from '../constants'
import { Law } from '@komgo/types'
import { fakeDocument } from '../../letter-of-credit-legacy/utils/faker'
import { PERMITTED_MIME_TYPES } from '../../document-management/utils/permittedMimeTypes'
import { ICreateOrUpdateTrade } from '../store/types'
import { v4 } from 'uuid'

describe('formatTradeDate', () => {
  let trade: ITrade

  beforeEach(() => {
    trade = {
      ...fakeTrade(),
      deliveryPeriod: {
        startDate: '2019-01-03T13:14:28.025Z',
        endDate: '2019-01-08T13:14:28.025Z'
      },
      dealDate: '2019-01-01T13:14:28.025Z',
      contractDate: '2019-01-03T13:14:28.025Z'
    }
  })

  it('should format date (api format) to match select input format', () => {
    const expected = {
      ...trade,
      deliveryPeriod: {
        startDate: '2019-01-03',
        endDate: '2019-01-08'
      },
      dealDate: '2019-01-01',
      contractDate: '2019-01-03'
    }

    const formatedTrade = formatTradeDate(trade)

    expect(formatedTrade).toEqual(expected)
  })
  it('should format date to match select format', () => {
    trade = {
      ...trade,
      deliveryPeriod: {
        startDate: '2019-01-03',
        endDate: '2019-01-08'
      },
      dealDate: '2019-01-01',
      contractDate: '2019-01-03'
    }

    const expected = { ...trade }

    const formatedTrade = formatTradeDate(trade)

    expect(formatedTrade).toEqual(expected)
  })
})

describe('formatEditTrade', () => {
  let trade: ITrade
  let cargo: ICargo
  let documents

  beforeEach(() => {
    trade = {
      ...fakeTrade(),
      deliveryPeriod: {
        startDate: '2019-01-03T13:14:28.025Z',
        endDate: '2019-01-08T13:14:28.025Z'
      },
      dealDate: '2019-01-01T13:14:28.025Z'
    }
    cargo = {
      ...fakeCargo({ parcels: [fakeParcel({ timestamp: '2019-01-03T13:14:28.025Z' })] })
    }
    documents = [fakeDocument({ name: 'document.png', id: '1' })]
  })

  it('should format date (api format) to match select input format', () => {
    const expectedTradeChanges = {
      deliveryPeriod: {
        startDate: '2019-01-03',
        endDate: '2019-01-08'
      },
      dealDate: '2019-01-01'
    }
    const expectedParcelChanges = {
      laycanPeriod: {
        startDate: '2019-01-03',
        endDate: '2019-01-03'
      },
      deemedBLDate: '2019-01-03'
    }

    const formatedFormData = formatEditTrade(trade, [cargo], documents)

    expect(formatedFormData.trade).toEqual(expect.objectContaining(expectedTradeChanges))
    expect(formatedFormData.cargo.parcels[0]).toEqual(expect.objectContaining(expectedParcelChanges))
  })
  it('should format date to match select format', () => {
    const expectedTradeChanges = {
      deliveryPeriod: {
        startDate: '2019-01-03',
        endDate: '2019-01-08'
      },
      dealDate: '2019-01-01'
    }

    const formatedTrade = formatEditTrade(trade, [], [])

    expect(formatedTrade.trade).toEqual(expect.objectContaining(expectedTradeChanges))
  })

  describe('Law: Other', () => {
    it('should set to Other if entered', () => {
      trade = {
        ...trade,
        law: 'some other value' as any
      }

      const formattedTrade = formatEditTrade(trade, [], [])

      expect(formattedTrade.trade).toMatchObject(expect.objectContaining({ law: Law.Other }))
      expect(formattedTrade.lawOther).toEqual(trade.law)
    })

    it('should leave blank if nothing specified', () => {
      trade = {
        ...trade,
        law: ''
      }

      const formatedTrade = formatEditTrade(trade, [], [])

      expect(formatedTrade.trade.law).toBe(trade.law)
      expect(formatedTrade.lawOther).toEqual('')
    })
  })
  describe('Commodity: Other', () => {
    it('should set the commodity enum if it is one of the enum commodities and not set .commodityOther', () => {
      const trade = buildFakeTrade({ commodity: Commodity.OilProducts })

      const formatedTrade = formatEditTrade(trade, [], [])

      expect(formatedTrade.trade.commodity).toEqual(trade.commodity)
      expect(formatedTrade.commodityOther).toEqual('')
    })
    it('should set trade.commodity to OTHER and set value to .commodityOther if not one of the enum commodities', () => {
      const trade = buildFakeTrade({ commodity: 'wood' })

      const formatedTrade = formatEditTrade(trade, [], [])

      expect(formatedTrade.trade.commodity).toEqual(Commodity.Other)
      expect(formatedTrade.commodityOther).toEqual(trade.commodity)
    })
  })
  describe('event base: Other', () => {
    it('should set the event base enum if it is one of the enum event base and not set .eventBaseOther', () => {
      const orig = buildFakeTrade()
      const trade: ITrade = {
        ...orig,
        paymentTerms: { ...orig.paymentTerms, eventBase: PaymentTermsEventBase.NoticeOfReadiness }
      }

      const formattedTrade = formatEditTrade(trade, [], [])

      expect(formattedTrade.trade.paymentTerms.eventBase).toEqual(trade.paymentTerms.eventBase)
      expect(formattedTrade.eventBaseOther).toEqual('')
    })
    it('should set trade.paymentTerms.eventBase to OTHER and set value to .eventBaseOther if not one of the enum PaymentTermsEventBase', () => {
      const orig = buildFakeTrade()
      const trade: ITrade = { ...orig, paymentTerms: { ...orig.paymentTerms, eventBase: 'otherEventBase' } }

      const formattedTrade = formatEditTrade(trade, [], [])

      expect(formattedTrade.trade.paymentTerms.eventBase).toEqual(PaymentTermsEventBase.Other)
      expect(formattedTrade.eventBaseOther).toEqual(trade.paymentTerms.eventBase)
    })
  })
  describe('deliveryTerms: Other', () => {
    it('should set the deliveryTerms enum if it is one of the enum event base and not set .deliveryTermsOther', () => {
      const trade = buildFakeTrade({ deliveryTerms: DeliveryTerms.FAS, version: TRADE_SCHEMA_VERSION.V2 })

      const formattedTrade = formatEditTrade(trade, [], [])

      expect(formattedTrade.trade.deliveryTerms).toEqual(trade.deliveryTerms)
      expect(formattedTrade.deliveryTermsOther).toEqual('')
    })
    it('should set trade.paymentTerms.eventBase to OTHER and set value to .eventBaseOther if not one of the enum PaymentTermsEventBase', () => {
      const trade = buildFakeTrade({ deliveryTerms: 'DIFFERENT_TERM' as any, version: TRADE_SCHEMA_VERSION.V2 })

      const formattedTrade = formatEditTrade(trade, [], [])

      expect(formattedTrade.trade.deliveryTerms).toEqual(DeliveryTerms.Other)
      expect(formattedTrade.deliveryTermsOther).toEqual(trade.deliveryTerms)
    })
  })
  describe('modeOfTransport: Other', () => {
    it('should set modeOfTransport enum if it is one of the enums from ModeOfTransport, and leave .modeOfTransportOther alone', () => {
      const cargo = buildFakeCargo({ parcels: [buildFakeParcel({ modeOfTransport: ModeOfTransport.ITT })] })

      const formattedTrade: any = formatEditTrade(buildFakeTrade(), [cargo], [])

      expect(formattedTrade.cargo.parcels[0].modeOfTransport).toEqual(ModeOfTransport.ITT)
      expect(formattedTrade.cargo.parcels[0].modeOfTransportOther).toEqual('')
    })
    it('should set modeOfTransport to OTHER and set value to .modeOfTransportOther if not one of the enum ModeOfTransport', () => {
      const cargo = buildFakeCargo({ parcels: [buildFakeParcel({ modeOfTransport: 'BIKE' })] })

      const formattedTrade: any = formatEditTrade(buildFakeTrade(), [cargo], [])

      expect(formattedTrade.cargo.parcels[0].modeOfTransport).toEqual(ModeOfTransport.Other)
      expect(formattedTrade.cargo.parcels[0].modeOfTransportOther).toEqual(cargo.parcels[0].modeOfTransport)
    })
  })
})

describe('formatDocuments', () => {
  it('should return empty array if documents do not exist', () => {
    expect(formatDocuments([])).toEqual([])
  })

  it('should return array with one document', () => {
    const fakeDocuments = fakeDocument({ name: 'document.png', id: '1' })

    const expectedDocument = {
      id: '1',
      name: 'document',
      categoryId: 'banking-documents',
      typeId: '2',
      fileName: 'document.png',
      fileType: PERMITTED_MIME_TYPES.PNG_MIME_TYPE,
      file: null
    }

    expect(formatDocuments([fakeDocuments])).toEqual([expectedDocument])
  })
})

describe('findMimeType', () => {
  it('should return empty string if mime type is not found', () => {
    expect(findMimeType('test.123')).toEqual('')
  })

  it('should return image/png if document is png image', () => {
    expect(findMimeType('test.png')).toEqual(PERMITTED_MIME_TYPES.PNG_MIME_TYPE)
  })
})

describe('generateInitialFormData', () => {
  it('overwrites the buyer with the company name for an edited trade', () => {
    const trade = buildFakeTrade({ buyer: 'bbbb-uuid', seller: 'ssss-uuid' })
    const cargos = [buildFakeCargo()]
    const documents = []
    const tradingRole = TRADING_ROLE_OPTIONS.BUYER
    const company = v4()

    const initialData = generateInitialFormData(trade, cargos, documents, tradingRole, company)

    expect(initialData.trade.seller).toEqual('ssss-uuid')
    expect(initialData.trade.buyer).toEqual(company)
  })
})
