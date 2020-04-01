import { validate, validateCargo, createEditTradeValidator } from './validator'
import { initialParcelData, initialCargoData, initialTradeData, TradingRole } from '../constants'
import { ICreateOrUpdateTrade } from '../store/types'
import { fakeCargo, fakeParcel, fakeTradeSeller } from '../../letter-of-credit-legacy/utils/faker'
import { formatEditTrade } from './formatters'
import {
  Law,
  CreditRequirements,
  buildFakeTrade,
  ITrade,
  ICargo,
  InvoiceQuantity,
  buildFakeCargo,
  buildFakeParcel,
  Commodity,
  DeliveryTerms,
  PaymentTermsEventBase
} from '@komgo/types'
import uuid from 'uuid'
import _ from 'lodash'

const initialTradeAndCargoData: ICreateOrUpdateTrade = {
  trade: initialTradeData as any,
  cargo: initialCargoData as any,
  documents: [],
  lawOther: ''
}

describe('validateCargo', () => {
  it('should return empty object if all required trade and cargo fields specified', () => {
    const form = {
      trade: initialTradeData,
      documents: [],
      lawOther: '',
      cargo: { ...initialCargoData, grade: 'BRENT', cargoId: '123' }
    }
    const expected = {}

    expect(validateCargo(form as any)).toEqual(expected)
  })

  it('should return error for cargoId if grade specified', () => {
    const form = {
      trade: initialTradeData,
      documents: [],
      lawOther: '',
      cargo: { ...initialCargoData, grade: 'BRENT' }
    }
    const expected = { 'cargo.cargoId': "'cargoId' should not be empty" }

    expect(validateCargo(form as any)).toEqual(expected)
  })
})

describe('validate', () => {
  let trade: ITrade
  let cargo: ICargo

  beforeEach(() => {
    const timestamp = '2019-01-03'
    trade = {
      ...buildFakeTrade(),
      deliveryPeriod: {
        startDate: timestamp,
        endDate: '2019-01-08'
      },
      dealDate: '2019-01-01',
      invoiceQuantity: InvoiceQuantity.Load,
      contractDate: '2019-01-02'
    }
    cargo = {
      ...buildFakeCargo({
        parcels: [buildFakeParcel({ startDate: timestamp, endDate: timestamp, deemedBLDate: timestamp })]
      })
    }
  })

  it('should return error for cargoId and grade if parcel specified, but no grade or cargoId', () => {
    const cargoWithoutCargoId = { ...cargo, cargoId: '', grade: '' }
    const form = { ...formatEditTrade(trade, [cargoWithoutCargoId], []) }
    const expected = { 'cargo.cargoId': "'cargoId' should not be empty" }

    expect(validate(form)).toEqual(expected)
  })

  it('should return errors for all required fields', () => {
    const expected = {
      'trade.buyerEtrmId': "'buyerEtrmId' should not be empty",
      'cargo.cargoId': "'cargoId' should not be empty",
      'trade.creditRequirement':
        "'creditRequirement' should be equal to one of the allowed values (DOCUMENTARY_LETTER_OF_CREDIT or STANDBY_LETTER_OF_CREDIT or OPEN_CREDIT or OFFSET or CREDIT_PENDING)",
      'trade.dealDate': "'dealDate' should not be empty",
      'trade.buyer': "'buyer' should not be empty",
      'trade.seller': "'seller' should not be empty",
      'trade.commodity': "'commodity' should not be empty"
    }

    expect(validate(initialTradeAndCargoData)).toEqual(expected)
  })

  it('should return error for cargoId and grade if parcel exists', () => {
    const cargoWithoutCargoIdAndGrade = { ...cargo, grade: '', cargoId: '' }
    const form = { ...initialTradeAndCargoData, ...cargoWithoutCargoIdAndGrade }

    expect(validate(form)).toEqual(
      expect.objectContaining({
        'cargo.cargoId': "'cargoId' should not be empty"
      })
    )
  })

  it('should pass with valid config', () => {
    expect(validate({ cargo, trade, documents: [] })).toEqual({})
  })

  it('should return general parcels error if a parcel data is invalid', () => {
    const form: ICreateOrUpdateTrade = { trade, documents: [], cargo: buildFakeCargo({ parcels: [initialParcelData] }) }

    expect(validate(form)).toEqual({ 'cargo.parcels': 'Parcels validation error, see below.' })
  })

  it('should return error if minTolerance is greater than maxTolerance', () => {
    const form: ICreateOrUpdateTrade = {
      trade: { ...trade, minTolerance: 5, maxTolerance: 4 },
      documents: [],
      cargo
    }

    expect(validate(form)).toEqual({
      'trade.minTolerance': "'minTolerance' should be less than or equal to 'Max tolerance'.",
      'trade.maxTolerance': "'maxTolerance' should be greater than or equal to 'Min tolerance'."
    })
  })
})

describe('createEditTradeValidator', () => {
  let validate: (values: ICreateOrUpdateTrade) => object
  let trade: ITrade
  let cargo: ICargo
  let initial: ICreateOrUpdateTrade
  beforeEach(() => {
    const timestamp = '2019-01-03'
    trade = {
      ...buildFakeTrade(),
      deliveryPeriod: {
        startDate: timestamp,
        endDate: '2019-01-08'
      },
      dealDate: '2019-01-01',
      invoiceQuantity: InvoiceQuantity.Load,
      contractDate: '2019-01-02'
    }
    cargo = {
      ...buildFakeCargo({
        parcels: [buildFakeParcel({ startDate: timestamp, endDate: timestamp, deemedBLDate: timestamp })]
      })
    }
    initial = { cargo, trade, documents: [] }
    validate = createEditTradeValidator(initial)
  })
  it('should fail for all non-editable fields changed', () => {
    expect(validate(modifyAllFields(initial))).toEqual({
      buyer: '"buyer" cannot be edited',
      cargoId: '"cargoId" cannot be edited',
      creditRequirement: '"creditRequirement" cannot be edited',
      currency: '"currency" cannot be edited',
      deliveryLocation: '"deliveryLocation" cannot be edited',
      grade: '"grade" cannot be edited',
      invoiceQuantity: '"invoiceQuantity" cannot be edited',
      seller: '"seller" cannot be edited',
      sellerEtrmId: '"sellerEtrmId" cannot be edited',
      source: '"source" cannot be edited',
      sourceId: '"sourceId" cannot be edited',
      status: '"status" cannot be edited',
      version: '"version" cannot be edited'
    })
  })
  it('should fail if no changes are made', () => {
    expect(validate(initial)).toEqual({ all: 'You have not made any changes' })
  })
  it('should pass if editable field is passed', () => {
    expect(
      validate({
        ...initial,
        trade: {
          ...initial.trade,
          buyerEtrmId: uuid.v4()
        },
        cargo: {
          ...initial.cargo,
          parcels: [buildFakeParcel({ deemedBLDate: '2019-01-03' })]
        }
      })
    ).toEqual({})
  })

  describe('validate edit cargo', () => {
    let initialData

    beforeEach(() => {
      initialData = {
        ...initial,
        cargo: {
          ...initial.cargo,
          _id: undefined,
          cargoId: uuid()
        }
      }
    })

    it('should skip cargoId check if no old cargo in initial values', () => {
      validate = createEditTradeValidator(initialData)

      expect(
        validate({
          ...initial,
          cargo: {
            ...initialData.cargo,
            _id: undefined,
            cargoId: uuid()
          }
        })
      ).toEqual({})
    })

    it('should fail on cargoId change if editing existing cargo', () => {
      const data = {
        ...initialData,
        cargo: {
          ...initialData.cargo,
          _id: uuid(),
          cargoId: uuid()
        }
      }
      validate = createEditTradeValidator(data)

      expect(
        validate({
          ...data,
          cargo: {
            ...data.cargo,
            cargoId: uuid()
          }
        })
      ).toEqual({
        cargoId: '"cargoId" cannot be edited'
      })
    })
  })
})

describe('validateSellerTrades', () => {
  it('should validate without error for seller trade data', () => {
    const values: ICreateOrUpdateTrade = {
      trade: fakeTradeSeller(),
      cargo: {
        cargoId: '',
        parcels: []
      } as any,
      documents: []
    }

    const expected = {}

    expect(validate(values)).toEqual(expected)
  })

  it('should validate with error for required fields on seller trades', () => {
    const values: ICreateOrUpdateTrade = {
      ...initialTradeAndCargoData,
      trade: {
        ...initialTradeAndCargoData.trade,
        creditRequirement: CreditRequirements.OpenCredit,
        tradingRole: TradingRole.SELLER
      }
    }

    const expected = {
      'trade.buyer': "'buyer' should not be empty",
      'trade.commodity': "'commodity' should not be empty",
      'trade.dealDate': "'dealDate' should not be empty",
      'trade.seller': "'seller' should not be empty",
      'trade.sellerEtrmId': "'sellerEtrmId' should not be empty"
    }

    expect(validate(values)).toEqual(expected)
  })

  it('should validate without error for seller trade data if non-required fields are still provided as empty strings', () => {
    const values: ICreateOrUpdateTrade = {
      trade: {
        ...fakeTradeSeller(),
        demurrageTerms: '',
        laytime: ''
      },
      documents: [],
      cargo: {
        cargoId: '',
        parcels: []
      } as any
    }

    const expected = {}

    expect(validate(values)).toEqual(expected)
  })

  it('should allow buyerEtrmID to be provided', () => {
    const values: ICreateOrUpdateTrade = {
      trade: { ...fakeTradeSeller(), buyerEtrmId: 'SOMETHING' },
      documents: [],
      cargo: {
        cargoId: '',
        parcels: []
      } as any
    }

    const expected = {}

    expect(validate(values)).toEqual(expected)
  })

  it('should allow cargo to exist', () => {
    const values: ICreateOrUpdateTrade = {
      trade: fakeTradeSeller(),
      documents: [],
      cargo: {
        cargoId: '123',
        grade: 'BRENT',
        ...fakeCargo({ parcels: [fakeParcel({ timestamp: '2019-01-03' })] })
      }
    }

    const expected = {}

    expect(validate(values)).toEqual(expected)
  })

  it('should fail validation if law is other and no law specified', () => {
    const values: ICreateOrUpdateTrade = {
      trade: {
        ...fakeTradeSeller(),
        law: Law.Other
      },
      documents: [],
      lawOther: '',
      cargo: fakeCargo({ parcels: [fakeParcel({ timestamp: '2019-01-03' })], grade: 'BRENT', cargoId: '123' })
    }

    const expected = { lawOther: "'Law' should be specified if you have selected OTHER" }

    expect(validate(values)).toEqual(expected)
  })

  it('should fail validation if commodity is other and no commodity specified', () => {
    const values: ICreateOrUpdateTrade = {
      trade: {
        ...fakeTradeSeller(),
        commodity: Commodity.Other
      },
      documents: [],
      commodityOther: '',
      cargo: fakeCargo({ parcels: [fakeParcel({ timestamp: '2019-01-03' })], grade: 'BRENT', cargoId: '123' })
    }

    const expected = { commodityOther: "'Commodity type' should be specified if you have selected OTHER" }

    expect(validate(values)).toEqual(expected)
  })

  it('should fail validation if deliveryTerms is other and no deliveryTerms specified', () => {
    const values: ICreateOrUpdateTrade = {
      trade: {
        ...fakeTradeSeller(),
        deliveryTerms: DeliveryTerms.Other
      },
      documents: [],
      deliveryTermsOther: '',
      cargo: fakeCargo({ parcels: [fakeParcel({ timestamp: '2019-01-03' })], grade: 'BRENT', cargoId: '123' })
    }

    const expected = { deliveryTermsOther: "'Delivery terms' should be specified if you have selected OTHER" }

    expect(validate(values)).toEqual(expected)
  })

  it('should fail validation if eventBase is other and no eventBase specified', () => {
    const trade = fakeTradeSeller()
    const values: ICreateOrUpdateTrade = {
      trade: {
        ...trade,
        paymentTerms: {
          ...trade.paymentTerms,
          eventBase: PaymentTermsEventBase.Other
        }
      },
      documents: [],
      eventBaseOther: '',
      cargo: fakeCargo({ parcels: [fakeParcel({ timestamp: '2019-01-03' })], grade: 'BRENT', cargoId: '123' })
    }

    const expected = { eventBaseOther: "'Payment terms' should be specified if you have selected OTHER" }

    expect(validate(values)).toEqual(expected)
  })
})

function modifyAllFields(initial: ICreateOrUpdateTrade): ICreateOrUpdateTrade {
  return _.merge(_.cloneDeep(initial), {
    cargo: {
      cargoId: 'test-cargoId-1',
      grade: 'OSBERG',
      originOfGoods: 'Japan',
      parcels: [
        {
          deemedBLDate: '2019-02-23',
          destinationPlace: 'Cardiff',
          id: '1432',
          laycanPeriod: {
            endDate: '2018-01-03',
            startDate: '2019-01-03'
          },
          loadingPlace: 'Portobello',
          modeOfTransport: 'VESSEL',
          quantity: 50000,
          version: 5
        }
      ],
      quality: 'top',
      source: 'VAKT',
      sourceId: 'E2389423',
      status: 'TO_BE_DISCOUNTED',
      version: 2
    },
    documents: [],
    trade: {
      buyer: 'node.1234',
      buyerEtrmId: 'buyerEtrmId-2',
      commodity: 'CRUDE_OIL',
      contractDate: '2019-01-03',
      creditRequirement: 'OPEN_CREDIT',
      currency: 'USD',
      dealDate: '2019-01-04',
      deliveryLocation: 'Cardiff',
      deliveryPeriod: {
        endDate: '2019-07-08',
        startDate: '2019-05-03'
      },
      deliveryTerms: 'FOB',
      invoiceQuantity: 'DISCHARGE',
      maxTolerance: 1.25,
      minTolerance: 1.25,
      paymentTerms: {
        dayType: 'CALENDAR',
        eventBase: 'BL',
        time: 35,
        timeUnit: 'DAYS',
        when: 'AFTER'
      },
      paymentTermsOption: 'DEFERRED',
      price: 74.02,
      priceUnit: 'BBL',
      quantity: 600200,
      seller: 'node.3215',
      sellerEtrmId: 'sellerE',
      source: 'VAKT',
      sourceId: 'sourceId',
      status: 'TO_BE_DISCOUNTED',
      version: 7
    }
  })
}
