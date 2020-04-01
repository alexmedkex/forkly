import 'reflect-metadata'
import { axiosMock, getAPI, postAPI, putAPI } from './utils/axios-utils'
import { stringify } from 'qs'
import { IntegrationEnvironment } from './utils/IntegrationEnvironment'
import { IPaginate } from '../src/service-layer/controllers/IPaginate'
import {
  CreditRequirements,
  ICargo,
  ICargoBase,
  ITrade,
  ITradeBase,
  TradeSource,
  TRADE_SCHEMA_VERSION,
  CARGO_SCHEMA_VERSION
} from '@komgo/types'
import validator from 'validator'
import { generateMovementData, integrationTestSellerStaticId, TradeType } from './utils/utils'

jest.setTimeout(90000)
let environment: IntegrationEnvironment

describe('movements', () => {
  beforeAll(async () => {
    environment = new IntegrationEnvironment()
    await environment.start(integrationTestSellerStaticId)
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

  describe('SALE trade tests - TRADE_SCHEMA - V1', () => {
    it('should save a new trade and cargo when sellerEtrmId is present, find api', async () => {
      const { tradeBase, cargoBase } = generateMovementData(TradeType.Seller)
      const savedTrade = await runSaveTradeTest(tradeBase, cargoBase)

      assertSellerTradeFields(savedTrade)
    })

    it('should save a new trade and cargo when buyerEtrmId, generalT&Cs, law is empty string, find api', async () => {
      const { tradeBase, cargoBase } = generateMovementData(TradeType.Seller)
      tradeBase.buyerEtrmId = ''
      tradeBase.law = '' as any
      tradeBase.generalTermsAndConditions = ''
      const savedTrade = await runSaveTradeTest(tradeBase, cargoBase)

      assertSellerTradeFields(savedTrade)
    })

    it('should save a new trade and cargo when buyerEtrmId is null, find api', async () => {
      const { tradeBase, cargoBase } = generateMovementData(TradeType.Seller)

      tradeBase.buyerEtrmId = null

      const savedTrade = await runSaveTradeTest(tradeBase, cargoBase)

      assertSellerTradeFields(savedTrade)
    })

    it('should error on validation if sellerEtrmId is not present', async () => {
      const { tradeBase } = generateMovementData(TradeType.Seller)
      delete tradeBase.sellerEtrmId

      await postAPI(`trades`, tradeBase)
        .then(() => {
          fail('should fail')
        })
        .catch(error => {
          expect(error.response.status).toEqual(400)
          expect(error.response.data.fields[0].message).toBe(`should have required property 'sellerEtrmId'`)
        })
    })

    it('should error on validation if buyerEtrmId is populated in a SALE trade', async () => {
      const { tradeBase } = generateMovementData(TradeType.Seller)
      tradeBase.creditRequirement = CreditRequirements.OpenCredit
      tradeBase.buyerEtrmId = 'buyerEtrmId'

      await postAPI(`trades`, tradeBase)
        .then(() => {
          fail('should fail')
        })
        .catch(error => {
          expect(error.response.status).toEqual(400)
          expect(error.response.data.fields[0].dataPath).toBe('.buyerEtrmId')
        })
    })

    it('should error on validation if laytime & demurridge are populated', async () => {
      const { tradeBase } = generateMovementData(TradeType.Seller)
      tradeBase.demurrageTerms = 'deT'
      tradeBase.laytime = 'lay'

      await postAPI(`trades`, tradeBase)
        .then(() => {
          fail('should fail')
        })
        .catch(error => {
          expect(error.response.status).toEqual(400)
          expect(error.response.data.fields[0].dataPath).toBe('.demurrageTerms')
          expect(error.response.data.fields[1].dataPath).toBe('.laytime')
          expect(error.response.data.fields.length).toEqual(3)
        })
    })

    it('fails if a duplicate sellerEtrmId is used', async () => {
      const { tradeBase } = generateMovementData(TradeType.Seller)
      // creat trade
      await postAPI(`trades`, tradeBase)

      // create trade with same buyerEtrmId
      await expect(postAPI(`trades`, tradeBase)).rejects.toMatchObject({
        response: {
          status: 409,
          data: { message: `Trade with the same Seller EtrmID already exists. EtrmId: ${tradeBase.sellerEtrmId}` }
        }
      })
    })

    it('fails update if a duplicated sellerEtrmId is used', async () => {
      const { tradeBase: firstTrade } = generateMovementData(TradeType.Seller)
      const { tradeBase: secondTrade } = generateMovementData(TradeType.Seller)
      const firstCreateTradeResponse = await postAPI(`trades`, firstTrade)
      // create the second trade and use the sellerEtrmId for the update
      await postAPI(`trades`, secondTrade)

      const getTrade = await getAPI<ITrade>(`trades/${firstCreateTradeResponse.data._id}`)

      // LS workaround it seems the UI is fixing this somehow.
      // casing ISO Date string to simple date
      const [dealDate] = (getTrade.data.dealDate as string).split('T')
      const [startDate] = (getTrade.data.deliveryPeriod.startDate as string).split('T')
      const [endDate] = (getTrade.data.deliveryPeriod.endDate as string).split('T')

      firstTrade.sellerEtrmId = secondTrade.sellerEtrmId

      const updateFirstTrade: ITrade = {
        ...getTrade.data,
        dealDate,
        deliveryPeriod: { startDate, endDate },
        sellerEtrmId: secondTrade.sellerEtrmId,
        sourceId: firstCreateTradeResponse.data.sourceId,
        _id: firstCreateTradeResponse.data._id,
        status: firstCreateTradeResponse.data.status
      }

      const result = putAPI(`trades/${firstCreateTradeResponse.data._id}`, updateFirstTrade)

      await expect(result).rejects.toMatchObject({
        response: {
          status: 409,
          data: {
            message: `Trade with the same Seller EtrmID already exists. EtrmId: ${secondTrade.sellerEtrmId}`
          }
        }
      })
    })

    it('updates a trade when the existing trade has buyerEtrmId undefined but an empty string is provided', async () => {
      const { tradeBase } = generateMovementData(TradeType.Seller)
      const createTrade = await postAPI(`trades`, tradeBase)
      let getTrade = await getAPI<ITrade>(`trades/${createTrade.data._id}`)

      // LS workaround it seems the UI is fixing this somehow.
      // casing ISO Date string to simple date
      const [dealDate] = (getTrade.data.dealDate as string).split('T')
      const [startDate] = (getTrade.data.deliveryPeriod.startDate as string).split('T')
      const [endDate] = (getTrade.data.deliveryPeriod.endDate as string).split('T')

      const updateFirstTrade: ITrade = {
        ...getTrade.data,
        dealDate,
        deliveryPeriod: { startDate, endDate },
        sourceId: createTrade.data.sourceId,
        _id: createTrade.data._id,
        status: createTrade.data.status
      }

      await putAPI(`trades/${createTrade.data._id}`, updateFirstTrade)

      getTrade = await getAPI<ITrade>(`trades/${createTrade.data._id}`)

      expect(getTrade.data).toMatchObject({
        price: tradeBase.price,
        sourceId: updateFirstTrade.sourceId,
        source: tradeBase.source,
        buyer: tradeBase.buyer,
        seller: tradeBase.seller
      })
    })

    function assertSellerTradeFields(savedTrade) {
      expect(savedTrade.creditRequirement).toBe(CreditRequirements.OpenCredit)
      expect(savedTrade.sellerEtrmId).toBeTruthy()
      expect(savedTrade.buyerEtrmId).toBeFalsy()
    }
  })

  describe('SALE trade tests - TRADE_SCHEMA - V2', () => {
    it('should save a new trade and cargo when sellerEtrmId is present, find api', async () => {
      const { tradeBase, cargoBase } = generateMovementData(TradeType.Seller)
      const savedTrade = await runSaveTradeTest(tradeBase, cargoBase)

      assertSellerTradeFields(savedTrade)
    })

    it('should save a new trade and cargo when buyerEtrmId, generalT&Cs, law is empty string, find api', async () => {
      const { tradeBase, cargoBase } = generateMovementData(TradeType.Seller)
      tradeBase.buyerEtrmId = ''
      tradeBase.law = '' as any
      tradeBase.generalTermsAndConditions = ''
      const savedTrade = await runSaveTradeTest(tradeBase, cargoBase)

      assertSellerTradeFields(savedTrade)
    })

    it('should save a new trade and cargo when buyerEtrmId is null, find api', async () => {
      const { tradeBase, cargoBase } = generateMovementData(
        TradeType.Seller,
        TRADE_SCHEMA_VERSION.V2,
        CARGO_SCHEMA_VERSION.V2
      )

      tradeBase.buyerEtrmId = null

      const savedTrade = await runSaveTradeTest(tradeBase, cargoBase)

      assertSellerTradeFields(savedTrade)
    })

    it('should error on validation if sellerEtrmId is not present', async () => {
      const { tradeBase } = generateMovementData(TradeType.Seller, TRADE_SCHEMA_VERSION.V2, CARGO_SCHEMA_VERSION.V2)
      delete tradeBase.sellerEtrmId

      await postAPI(`trades`, tradeBase)
        .then(() => {
          fail('should fail')
        })
        .catch(error => {
          expect(error.response.status).toEqual(400)
          expect(error.response.data.fields[0].message).toBe(`should have required property 'sellerEtrmId'`)
        })
    })

    it('should NOT error on validation if buyerEtrmId is populated in a SALE trade', async () => {
      const { tradeBase, cargoBase } = generateMovementData(
        TradeType.Seller,
        TRADE_SCHEMA_VERSION.V2,
        CARGO_SCHEMA_VERSION.V2
      )
      tradeBase.creditRequirement = CreditRequirements.OpenCredit
      tradeBase.buyerEtrmId = 'buyerEtrmId'

      const savedTrade = await runSaveTradeTest(tradeBase, cargoBase)

      expect(savedTrade.creditRequirement).toBe(CreditRequirements.OpenCredit)
      expect(savedTrade.sellerEtrmId).toBeTruthy()
      expect(savedTrade.buyerEtrmId).toBeTruthy()
    })

    it('should error on validation if laytime & demurridge are populated', async () => {
      const { tradeBase } = generateMovementData(TradeType.Seller, TRADE_SCHEMA_VERSION.V2, CARGO_SCHEMA_VERSION.V2)
      tradeBase.demurrageTerms = 'deT'
      tradeBase.laytime = 'lay'

      await postAPI(`trades`, tradeBase)
        .then(() => {
          fail('should fail')
        })
        .catch(error => {
          expect(error.response.status).toEqual(400)
          expect(error.response.data.fields[0].dataPath).toBe('.demurrageTerms')
          expect(error.response.data.fields[1].dataPath).toBe('.laytime')
          expect(error.response.data.fields.length).toEqual(3)
        })
    })

    it('fails if a duplicate sellerEtrmId is used', async () => {
      const { tradeBase } = generateMovementData(TradeType.Seller, TRADE_SCHEMA_VERSION.V2, CARGO_SCHEMA_VERSION.V2)
      // creat trade
      await postAPI(`trades`, tradeBase)

      // create trade with same buyerEtrmId
      await expect(postAPI(`trades`, tradeBase)).rejects.toMatchObject({
        response: {
          status: 409,
          data: { message: `Trade with the same Seller EtrmID already exists. EtrmId: ${tradeBase.sellerEtrmId}` }
        }
      })
    })

    it('fails update if a duplicated sellerEtrmId is used', async () => {
      const { tradeBase: firstTrade } = generateMovementData(
        TradeType.Seller,
        TRADE_SCHEMA_VERSION.V2,
        CARGO_SCHEMA_VERSION.V2
      )
      const { tradeBase: secondTrade } = generateMovementData(
        TradeType.Seller,
        TRADE_SCHEMA_VERSION.V2,
        CARGO_SCHEMA_VERSION.V2
      )
      const firstCreateTradeResponse = await postAPI(`trades`, firstTrade)
      // create the second trade and use the sellerEtrmId for the update
      await postAPI(`trades`, secondTrade)

      const getTrade = await getAPI<ITrade>(`trades/${firstCreateTradeResponse.data._id}`)

      // LS workaround it seems the UI is fixing this somehow.
      // casing ISO Date string to simple date
      const [dealDate] = (getTrade.data.dealDate as string).split('T')
      const [startDate] = (getTrade.data.deliveryPeriod.startDate as string).split('T')
      const [endDate] = (getTrade.data.deliveryPeriod.endDate as string).split('T')

      firstTrade.sellerEtrmId = secondTrade.sellerEtrmId

      const updateFirstTrade: ITrade = {
        ...getTrade.data,
        dealDate,
        deliveryPeriod: { startDate, endDate },
        sellerEtrmId: secondTrade.sellerEtrmId,
        sourceId: firstCreateTradeResponse.data.sourceId,
        _id: firstCreateTradeResponse.data._id,
        status: firstCreateTradeResponse.data.status
      }

      const result = putAPI(`trades/${firstCreateTradeResponse.data._id}`, updateFirstTrade)

      await expect(result).rejects.toMatchObject({
        response: {
          status: 409,
          data: {
            message: `Trade with the same Seller EtrmID already exists. EtrmId: ${secondTrade.sellerEtrmId}`
          }
        }
      })
    })

    it('updates a trade when the existing trade has buyerEtrmId undefined but an empty string is provided', async () => {
      const { tradeBase } = generateMovementData(TradeType.Seller, TRADE_SCHEMA_VERSION.V2, CARGO_SCHEMA_VERSION.V2)
      const createTrade = await postAPI(`trades`, tradeBase)
      let getTrade = await getAPI<ITrade>(`trades/${createTrade.data._id}`)

      // LS workaround it seems the UI is fixing this somehow.
      // casing ISO Date string to simple date
      const [dealDate] = (getTrade.data.dealDate as string).split('T')
      const [startDate] = (getTrade.data.deliveryPeriod.startDate as string).split('T')
      const [endDate] = (getTrade.data.deliveryPeriod.endDate as string).split('T')

      const updateFirstTrade: ITrade = {
        ...getTrade.data,
        dealDate,
        deliveryPeriod: { startDate, endDate },
        sourceId: createTrade.data.sourceId,
        _id: createTrade.data._id,
        status: createTrade.data.status
      }

      await putAPI(`trades/${createTrade.data._id}`, updateFirstTrade)

      getTrade = await getAPI<ITrade>(`trades/${createTrade.data._id}`)

      expect(getTrade.data).toMatchObject({
        price: tradeBase.price,
        sourceId: updateFirstTrade.sourceId,
        source: tradeBase.source,
        buyer: tradeBase.buyer,
        seller: tradeBase.seller
      })
    })

    function assertSellerTradeFields(savedTrade) {
      expect(savedTrade.creditRequirement).toBe(CreditRequirements.OpenCredit)
      expect(savedTrade.sellerEtrmId).toBeTruthy()
    }
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
