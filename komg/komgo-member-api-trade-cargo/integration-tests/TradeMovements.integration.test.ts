import 'reflect-metadata'
import { axiosMock, deleteAPI, getAPI, postAPI, putAPI } from './utils/axios-utils'
import { stringify } from 'qs'
// const waitForExpect = require('wait-for-expect')
import { ErrorCode } from '@komgo/error-utilities'
import { IntegrationEnvironment } from './utils/IntegrationEnvironment'
import { IPaginate } from '../src/service-layer/controllers/IPaginate'
import {
  buildFakeCargoBase,
  CARGO_SCHEMA_VERSION,
  CreditRequirements,
  Grade,
  ICargo,
  ICargoBase,
  ITrade,
  ITradeBase,
  PaymentTermsOption,
  PriceOption,
  TRADE_SCHEMA_VERSION,
  TradeSource
} from '@komgo/types'
import validator from 'validator'
import { generateMovementData, integrationTestBuyerStaticId, TradeType } from './utils/utils'
import moment = require('moment')

jest.setTimeout(90000)
let environment: IntegrationEnvironment

describe('TradeMovements', () => {
  beforeAll(async () => {
    environment = new IntegrationEnvironment()
    await environment.start(integrationTestBuyerStaticId)
  })

  afterAll(async () => {
    await environment.stop(axiosMock)
  })

  beforeEach(async () => {
    await environment.beforeEach(axiosMock)
  })
  afterEach(async () => {
    await environment.afterEach(axiosMock)
  })

  describe('version 2', () => {
    describe('Trade', () => {
      it('creates', async () => {
        const data = generateMovementData(TradeType.Buyer, TRADE_SCHEMA_VERSION.V2, CARGO_SCHEMA_VERSION.V2)

        const trade = {
          ...data.tradeBase,
          requiredDocuments: [],
          deliveryLocation: 'some where',
          priceFormula: '2x',
          priceOption: PriceOption.Fix,
          paymentTermsOption: PaymentTermsOption.Deferred
        }

        const {
          data: { _id: tradeId, sourceId }
        } = await postAPI(`trades`, trade)

        const savedTrade = await getAPI<ITrade>(`trades/${tradeId}`)

        const { _id, createdAt, updatedAt, dealDate, deliveryPeriod, ...tradeProps } = savedTrade.data

        const newTrade = {
          ...tradeProps,
          dealDate: moment(dealDate).format('YYYY-MM-DD'),
          deliveryPeriod: {
            startDate: moment(deliveryPeriod.startDate).format('YYYY-MM-DD'),
            endDate: moment(deliveryPeriod.endDate).format('YYYY-MM-DD')
          }
        }
        expect(newTrade).toEqual({ status: 'TO_BE_FINANCED', sourceId, ...trade })
      })
    })

    describe('Cargo', () => {
      it('creates', async () => {
        const data = generateMovementData(TradeType.Buyer, TRADE_SCHEMA_VERSION.V2, CARGO_SCHEMA_VERSION.V2)

        const {
          data: { sourceId }
        } = await postAPI(`trades`, data.tradeBase)

        const cargo = {
          ...data.cargoBase,
          sourceId,
          quality: 'average',
          originOfGoods: 'UK'
        }

        const {
          data: { _id: cargoId }
        } = await postAPI(`movements`, cargo)

        const savedCargo = await getAPI<ICargo>(`movements/${cargoId}?source=${TradeSource.Komgo}`)

        const { _id, createdAt, updatedAt, parcels, ...cargoProps } = savedCargo.data

        const newCargo = {
          ...cargoProps,
          // tslint:disable-next-line
          parcels: parcels.map(({ _id, deemedBLDate, laycanPeriod, ...props }) => ({
            ...props,
            _id: undefined, // ignore it just during the test
            deemedBLDate: moment(deemedBLDate).format('YYYY-MM-DD'),
            laycanPeriod: {
              endDate: moment(laycanPeriod.endDate).format('YYYY-MM-DD'),
              startDate: moment(laycanPeriod.startDate).format('YYYY-MM-DD')
            }
          }))
        }
        // expect(generatedSourceId).toEqual(cargo.sourceId)
        expect(newCargo).toEqual({ ...cargo, status: 'TO_BE_FINANCED' })
      })
    })
  })

  describe('Buyer trade tests', () => {
    it('saves new trade and cargo when sellerEtrmId is not present, find api', async () => {
      const data = generateMovementData(TradeType.Buyer)
      const trade = data.tradeBase
      const cargo = data.cargoBase

      const savedTrade = await runSaveTradeTest(trade, cargo)

      expect(savedTrade.creditRequirement).toEqual(CreditRequirements.DocumentaryLetterOfCredit)
      expect(savedTrade.buyerEtrmId).toBeTruthy()
      expect(savedTrade.sellerEtrmId).toBeFalsy()
    })

    it('saves new trade and cargo when sellerEtrmId, generalT&Cs, law, demurridge and laytime is empty string, find api', async () => {
      const data = generateMovementData(TradeType.Buyer)
      const trade = data.tradeBase
      const cargo = data.cargoBase
      trade.sellerEtrmId = ''
      trade.law = '' as any
      trade.generalTermsAndConditions = ''
      trade.demurrageTerms = ''
      trade.laytime = ''

      const savedTrade = await runSaveTradeTest(trade, cargo)

      assertBuyerTradeFields(savedTrade)
    })

    it('should error on validation if sellerEtrmId is populated for DocumentaryLetterOfCredit', async () => {
      const data = generateMovementData(TradeType.Buyer)
      data.tradeBase.sellerEtrmId = 'sellerEtrm'

      await postAPI(`trades`, data.tradeBase)
        .then(() => {
          fail('should fail')
        })
        .catch(error => {
          expect(error.response.status).toEqual(400)
          expect(error.response.data.fields[0].dataPath).toBe('.sellerEtrmId')
        })
    })

    it('saves new trade and cargo when sellerEtrmId is null, find api', async () => {
      const data = generateMovementData(TradeType.Buyer)
      const trade = data.tradeBase
      const cargo = data.cargoBase
      trade.sellerEtrmId = null

      const savedTrade = await runSaveTradeTest(trade, cargo)

      assertBuyerTradeFields(savedTrade)
    })

    it('should error on validation if buyerEtrmId is not present', async () => {
      const data = generateMovementData(TradeType.Buyer)
      delete data.tradeBase.buyerEtrmId

      await postAPI(`trades`, data.tradeBase)
        .then(() => {
          fail('should fail')
        })
        .catch(error => {
          expect(error.response.status).toEqual(400)
          expect(error.response.data.fields[0].message).toBe(`should have required property 'buyerEtrmId'`)
        })
    })

    it('should add a creditRequirement(if not present) before saving trade, find api', async () => {
      const data = generateMovementData(TradeType.Buyer)
      delete data.tradeBase.creditRequirement

      const savedTrade = await runSaveTradeTest(data.tradeBase, data.cargoBase)

      expect(savedTrade.creditRequirement).toBe(CreditRequirements.DocumentaryLetterOfCredit)
      expect(savedTrade.buyerEtrmId).toBeTruthy()
      expect(savedTrade.sellerEtrmId).toBeFalsy()
    })

    it('should generate sourceId (if not present) before saving trade, find api', async () => {
      const data = generateMovementData(TradeType.Buyer)

      const savedTrade = await runSaveTradeTest(data.tradeBase, data.cargoBase)

      expect(validator.isUUID(savedTrade.sourceId)).toBeTruthy()
      expect(savedTrade.sourceId).toEqual(savedTrade.sourceId)
    })

    it('update trade and cargo', async () => {
      const { cargoBase, tradeBase, trade } = generateMovementData(TradeType.Buyer)

      const createTrade = await postAPI(`trades`, tradeBase)

      let getTrade = await getAPI<ITrade>(`trades/${createTrade.data._id}`)

      const update: ICargoBase = {
        ...cargoBase,
        sourceId: createTrade.data.sourceId
      }

      const { data } = await postAPI(`movements`, update)
      const { _id: mongoId } = data

      // LS workaround it seems the UI is fixing this somehow.
      // casing ISO Date string to simple date
      const [dealDate] = (getTrade.data.dealDate as string).split('T')
      const [startDate] = (getTrade.data.deliveryPeriod.startDate as string).split('T')
      const [endDate] = (getTrade.data.deliveryPeriod.endDate as string).split('T')
      await putAPI(`trades/${createTrade.data._id}`, {
        ...getTrade.data,
        dealDate,
        deliveryPeriod: { startDate, endDate }
      })
      // LS End workaround

      getTrade = await getAPI<ITrade>(`trades/${createTrade.data._id}`)

      expect(getTrade.data).toMatchObject({
        price: trade.price,
        sourceId: createTrade.data.sourceId,
        source: trade.source,
        buyer: trade.buyer,
        seller: trade.seller
      })

      const getOldCargo = await getAPI<ICargo>(`movements/${mongoId}?source=${TradeSource.Komgo}`)

      const updateCargo = {
        ...getOldCargo.data,
        grade: Grade.Oseberg
      }
      updateCargo.parcels[0].dischargeArea = 'UPDATED AREA'

      await putAPI(`movements/${mongoId}`, { ...updateCargo })

      const getCargo = await getAPI<ICargo>(`movements/${mongoId}?source=${TradeSource.Komgo}`)

      expect(getCargo.data.grade).toEqual(updateCargo.grade)
      expect(getCargo.data.parcels[0].dischargeArea).toEqual(updateCargo.parcels[0].dischargeArea)
    })

    it('updates a trade when the existing trade has sellerEtrmId undefined but an empty string is provided', async () => {
      const { tradeBase } = generateMovementData(TradeType.Buyer)
      const createTrade = await postAPI(`trades`, tradeBase)

      let getTrade = await getAPI<ITrade>(`trades/${createTrade.data._id}`)

      // LS workaround it seems the UI is fixing this somehow.
      // casing ISO Date string to simple date
      const [dealDate] = (getTrade.data.dealDate as string).split('T')
      const [startDate] = (getTrade.data.deliveryPeriod.startDate as string).split('T')
      const [endDate] = (getTrade.data.deliveryPeriod.endDate as string).split('T')

      const newTradeUpdate: ITrade = {
        ...getTrade.data,
        dealDate,
        deliveryPeriod: { startDate, endDate },
        sourceId: createTrade.data.sourceId,
        _id: createTrade.data._id,
        status: createTrade.data.status,
        price: 150,
        sellerEtrmId: ''
      }

      // LS End workaround

      await putAPI<ITrade>(`trades/${createTrade.data._id}`, newTradeUpdate)

      getTrade = await getAPI<ITrade>(`trades/${createTrade.data._id}`)

      expect(getTrade.data).toMatchObject({
        price: newTradeUpdate.price,
        sourceId: newTradeUpdate.sourceId,
        source: newTradeUpdate.source,
        buyer: newTradeUpdate.buyer,
        seller: newTradeUpdate.seller
      })
    })

    it('fails POST if a duplicate buyerEtrmId is used', async () => {
      const { tradeBase } = generateMovementData(TradeType.Buyer)

      await postAPI(`trades`, tradeBase)

      await expect(postAPI(`trades`, tradeBase)).rejects.toMatchObject({
        response: {
          status: 409,
          data: { message: `Trade with the same Buyer EtrmID already exists. EtrmId: ${tradeBase.buyerEtrmId}` }
        }
      })
    })

    it('fails update if a duplicated buyerEtrmId is used', async () => {
      const { tradeBase: firstTrade } = generateMovementData(TradeType.Buyer)
      const { tradeBase: secondTrade } = generateMovementData(TradeType.Buyer)
      const firstCreateTradeResponse = await postAPI(`trades`, firstTrade)

      const getTrade = await getAPI<ITrade>(`trades/${firstCreateTradeResponse.data._id}`)
      // create the second trade and use the buyerEtrmId for the update
      await postAPI(`trades`, secondTrade)

      // LS workaround it seems the UI is fixing this somehow.
      // casing ISO Date string to simple date
      const [dealDate] = (getTrade.data.dealDate as string).split('T')
      const [startDate] = (getTrade.data.deliveryPeriod.startDate as string).split('T')
      const [endDate] = (getTrade.data.deliveryPeriod.endDate as string).split('T')

      const updateFirstTrade: ITrade = {
        ...getTrade.data,
        dealDate,
        deliveryPeriod: { startDate, endDate },
        buyerEtrmId: secondTrade.buyerEtrmId,
        sourceId: firstCreateTradeResponse.data.sourceId,
        _id: firstCreateTradeResponse.data._id,
        status: firstCreateTradeResponse.data.status
      }

      const result = putAPI(`trades/${firstCreateTradeResponse.data._id}`, updateFirstTrade)
      await expect(result).rejects.toMatchObject({
        response: {
          status: 409,
          data: {
            message: `Trade with the same Buyer EtrmID already exists. EtrmId: ${secondTrade.buyerEtrmId}`
          }
        }
      })
    })
    // flacky test it fails running with the other
    it.skip('delete trade and cargo', async () => {
      const { tradeBase, cargoBase } = generateMovementData(TradeType.Buyer)
      const postResponse = await postAPI(`trades`, tradeBase)
      const cargo = {
        ...cargoBase,
        sourceId: postResponse.data.sourceId
      }

      const {
        data: { _id: mongoId }
      } = await postAPI(`movements`, cargo)

      await deleteAPI(`movements/${mongoId}?source=${TradeSource.Komgo}`)
      await deleteAPI(`trades/${postResponse.data._id}`)

      // fetch
      const filter = {
        query: { sourceId: postResponse.data.sourceId, source: TradeSource.Komgo },
        projection: { status: 1, _id: 1 },
        options: { sort: { source: '-1', 'data.sourceId': '1' } }
      }
      const query = stringify(filter)

      const apiTrades = await getAPI<IPaginate<ITrade[]>>(`trades?filter=${query}`)
      expect(apiTrades.data.items.length).toEqual(0)

      const movementsFilter = {
        query: { sourceId: postResponse.data.sourceId, _id: mongoId },
        projection: { status: 1, _id: 1 },
        options: { sort: { source: '-1', 'data.sourceId': '1' } }
      }
      const movementsQuery = stringify(movementsFilter)
      const movements = await getAPI<IPaginate<ICargo[]>>(
        `movements?source=${TradeSource.Komgo}&filter=${movementsQuery}`
      )
      expect(movements.data.items.length).toEqual(0)
    })

    function assertBuyerTradeFields(savedTrade) {
      expect(savedTrade.creditRequirement).toBe(CreditRequirements.DocumentaryLetterOfCredit)
      expect(savedTrade.buyerEtrmId).toBeTruthy()
      expect(savedTrade.sellerEtrmId).toBeFalsy()
    }
  })

  // SourceId is generated now so it won't return this error
  it.skip('duplicate trade error', async () => {
    const data = generateMovementData(TradeType.Buyer)
    const createTradeResult = await postAPI(`trades`, data.trade)

    await expect(postAPI(`trades`, data.trade)).rejects.toMatchObject({
      response: {
        status: 409,
        data: {
          message: `Trade with same ID already exists. Source: ${data.trade.source}, Id: ${createTradeResult.data.sourceId}`
        }
      }
    })
  })

  it('duplicate cargo error', async () => {
    const { tradeBase } = generateMovementData(TradeType.Buyer)
    const createTradeResponse = await postAPI(`trades`, tradeBase)
    const cargo = buildFakeCargoBase({ sourceId: createTradeResponse.data.sourceId, grade: Grade.Forties })
    const response = await postAPI(`movements`, cargo)

    const {
      data: { _id }
    } = response

    await expect(postAPI(`movements`, cargo)).rejects.toMatchObject({
      response: {
        status: 400,
        data: {
          message: `source: ${cargo.source}, sourceId: ${createTradeResponse.data.sourceId}, cargoId: ${_id}`
        }
      }
    })
  })

  it('trade does not exist error', async () => {
    const { cargoBase } = generateMovementData(TradeType.Buyer)
    const cargo = {
      ...cargoBase,
      sourceId: 'wrongId'
    }
    await expect(postAPI(`movements`, cargo)).rejects.toMatchObject({
      response: {
        status: 400,
        data: { message: 'Trade for cargo does not exists' }
      }
    })
  })

  it('trade enum validation error', async () => {
    const { tradeBase } = generateMovementData(TradeType.Buyer)

    tradeBase.invoiceQuantity = 'FAIL_ENUM' as any
    tradeBase.deliveryTerms = 'FAIL_ENUM' as any

    await postAPI(`trades`, tradeBase)
      .then(() => {
        fail('should fail')
      })
      .catch(error => {
        expect(error.response.status).toEqual(400)
        expect(error.response.data.errorCode).toEqual(ErrorCode.ValidationHttpSchema)
        expect(error.response.data.fields).toEqual([
          {
            dataPath: '.invoiceQuantity',
            keyword: 'enum',
            message: 'should be equal to one of the allowed values',
            params: { allowedValues: ['LOAD', 'DISCHARGE'] },
            schemaPath: '#/properties/invoiceQuantity/enum'
          },
          {
            dataPath: '.deliveryTerms',
            keyword: 'enum',
            message: 'should be equal to one of the allowed values',
            params: { allowedValues: ['FOB', 'FIP', 'CIF', 'CFR'] },
            schemaPath: '#/properties/deliveryTerms/enum'
          }
        ])
      })
  })

  it('trade tolerance validation error', async () => {
    const { tradeBase } = generateMovementData(TradeType.Buyer)

    tradeBase.minTolerance = 50
    tradeBase.maxTolerance = 10

    await postAPI(`trades`, tradeBase)
      .then(() => {
        fail('should fail')
      })
      .catch(error => {
        expect(error.response.status).toEqual(400)
        expect(error.response.data.fields.length).toEqual(1)
      })
  })

  it('cargo validation error cargoId', async () => {
    const { tradeBase } = generateMovementData(TradeType.Buyer)
    const createTradeResponse = await postAPI(`trades`, tradeBase)

    const cargo = {
      ...buildFakeCargoBase({ sourceId: createTradeResponse.data.sourceId, grade: Grade.Forties }),
      cargoId: undefined
    }

    await postAPI(`movements`, cargo)
      .then(() => {
        fail('should fail')
      })
      .catch(error => {
        expect(error.response.status).toEqual(400)
        // TODO LS TSOA is failing plus the actual error isn't pushed back. Currently a generic "Internal Server Error" is returned
        // TODO LS turn off TSOA validation
        // expect(error.response.data.fields.length).toEqual(2)
      })
  })

  it('cargo validation error', async () => {
    const { tradeBase, cargoBase } = generateMovementData(TradeType.Buyer)

    const createTradeResponse = await postAPI(`trades`, tradeBase)

    cargoBase.grade = 'FAIL_VALUE' as any
    cargoBase.parcels[0].modeOfTransport = 'FAIL_VALUE' as any
    cargoBase.parcels[0].laycanPeriod.startDate = moment('2018-08-02').toDate()
    cargoBase.parcels[0].laycanPeriod.endDate = moment('2018-08-01').toDate()

    const cargoRequest = {
      ...cargoBase,
      sourceId: createTradeResponse.data.sourceId
    }

    await postAPI(`movements`, cargoRequest)
      .then(() => {
        fail('should fail')
      })
      .catch(error => {
        expect(error.response.status).toEqual(400)
        expect(error.response.data.fields.length).toEqual(3)
      })
  })

  async function runSaveTradeTest(trade: ITradeBase, cargo: ICargoBase): Promise<ITrade> {
    const createTradeResponse = await postAPI(`trades`, trade)

    expect(validator.isUUID(createTradeResponse.data.sourceId)).toBeTruthy()
    expect(createTradeResponse.data.source).toEqual(TradeSource.Komgo)

    const filter = {
      query: { sourceId: createTradeResponse.data.sourceId, source: TradeSource.Komgo },
      projection: { status: 1, _id: 1 },
      options: { sort: { source: '-1', 'data.sourceId': '1' } }
    }
    const query = stringify(filter)
    const apiTrades = await getAPI<IPaginate<ITrade[]>>(`trades?filter=${query}`)

    expect(apiTrades).toBeDefined()
    expect(apiTrades.data.items).not.toBeNull()
    expect(apiTrades.data.items.length).toEqual(1)
    expect(apiTrades.data.items[0]._id).toEqual(createTradeResponse.data._id)
    expect(apiTrades.data.items[0].sourceId).toEqual(createTradeResponse.data.sourceId)

    const requestCargo = {
      ...cargo,
      sourceId: apiTrades.data.items[0].sourceId
    }

    const {
      data: { _id: cargoId }
    } = await postAPI(`movements`, requestCargo)

    const apiTradeMovements = await getAPI<ICargo[]>(`trades/${createTradeResponse.data._id}/movements`)

    expect(apiTradeMovements).toBeDefined()
    expect(apiTradeMovements.data).not.toBeNull()
    expect(apiTradeMovements.data.length).toEqual(1)
    expect(apiTradeMovements.data[0].cargoId).toEqual(cargoId)
    expect(apiTradeMovements.data[0].sourceId).toEqual(apiTrades.data.items[0].sourceId)

    // validate that is on /movements endpoint
    const filterMovements = {
      query: { sourceId: createTradeResponse.data.sourceId },
      projection: { status: 1, _id: 1 },
      options: { sort: { source: '-1', 'data.sourceId': '1' } }
    }
    const queryMovements = stringify(filterMovements)
    const apiMovements = await getAPI<IPaginate<ICargo[]>>(
      `movements?filter=${queryMovements}&source=${TradeSource.Komgo}`
    )

    expect(apiMovements).toBeDefined()
    expect(apiMovements.data).not.toBeNull()
    expect(apiMovements.data.total).toEqual(1)
    expect(apiMovements.data.items[0].cargoId).toEqual(cargoId)
    expect(apiMovements.data.items[0].sourceId).toEqual(apiTrades.data.items[0].sourceId)

    return apiTrades.data.items[0]
  }
})
