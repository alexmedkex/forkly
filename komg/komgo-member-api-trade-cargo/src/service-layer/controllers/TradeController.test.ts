import { stringify } from 'qs'
import 'reflect-metadata'
// tslint:disable-next-line
import validator from 'validator'

import { TradeController } from './TradeController'
import { ITradeDataAgent } from '../../data-layer/data-agents/ITradeDataAgent'
import {
  buildFakeCargo,
  buildFakeTrade,
  buildFakeTradeBase,
  CreditRequirements,
  ICargo,
  ITrade,
  ITradeBase,
  TradeSource
} from '@komgo/types'
import { TradeValidationService } from '../../business-layer/validation/TradeValidationService'
import { ReceivableDiscountStatus } from '../../data-layer/constants/ReceivableDiscountStatus'
// tslint:disable-next-line: no-implicit-dependencies
import { createMockInstance } from 'jest-create-mock-instance'
import { TradeUpdateMessageUseCase } from '../../business-layer/TradeUpdateMessageUseCase'

const MockRequest = require('mock-express-request')

const BUYER = 'BUYER'
const SELLER = 'SELLER'

const MOCK_ID = '3ea30520n42b4n4495n964dn4e63224b8332'
const MOCK_DATA: ITradeBase = buildFakeTradeBase({
  buyerEtrmId: 'buyerEtrmId',
  buyer: BUYER,
  seller: SELLER
})
const MOCK_DATA_UPDATED: ITradeBase = { ...MOCK_DATA, price: Date.now() }

const MOCK_DATA_WITH_SOURCE_ID: ITrade = buildFakeTrade({
  buyerEtrmId: 'buyerEtrmId',
  buyer: BUYER,
  seller: SELLER
})
const MOCK_DATA_WITH_SOURCE_ID_UPDATED: ITrade = {
  ...MOCK_DATA_WITH_SOURCE_ID,
  price: Date.now()
}

const companyStaticId = BUYER

const MOCK_DATA_CARGO: ICargo = buildFakeCargo()
const MOCK_DATA_SELLER: ITradeBase = {
  ...MOCK_DATA,
  creditRequirement: CreditRequirements.OpenCredit
}

const MOCK_DATA_LC = [
  {
    _id: MOCK_ID,
    status: 'request'
  }
]

const mockTradeValidator = {
  validate: jest.fn()
}

let controller: TradeController
let mockTradeAgent: ITradeDataAgent

const mockCargoAgent: any = {
  find: jest.fn().mockReturnValue([MOCK_DATA_CARGO])
}

const mockTradeFinanceServiceClient: any = {
  getTradeFinanceServiceClient: jest.fn().mockReturnValue([MOCK_DATA_LC])
}
const mockCreateTrade = jest.fn().mockReturnValue(MOCK_ID)
let tradeValidationService: TradeValidationService

describe('TradeController', () => {
  let mockTradeUpdateMessageUseCase: jest.Mocked<TradeUpdateMessageUseCase>

  beforeEach(() => {
    mockTradeAgent = {
      create: mockCreateTrade,
      get: jest.fn(() => MOCK_DATA_WITH_SOURCE_ID),
      find: jest.fn().mockReturnValue([]),
      count: jest.fn().mockReturnValue(1),
      update: jest.fn().mockReturnValue(Promise.resolve()),
      delete: jest.fn(),
      findOne: jest.fn()
    }
    mockTradeValidator.validate.mockReset()

    mockTradeUpdateMessageUseCase = createMockInstance(TradeUpdateMessageUseCase)

    tradeValidationService = new TradeValidationService(
      mockTradeAgent,
      mockTradeValidator,
      MOCK_DATA_WITH_SOURCE_ID.buyer
    )

    controller = new TradeController(
      mockTradeAgent as any,
      mockCargoAgent,
      tradeValidationService,
      mockTradeFinanceServiceClient,
      mockTradeUpdateMessageUseCase,
      companyStaticId
    )
  })

  describe('.find', () => {
    beforeEach(() => {
      mockTradeAgent.find = jest.fn().mockReturnValue([MOCK_DATA_WITH_SOURCE_ID])
    })

    const filter = {
      query: { price: { $gt: '100' } },
      projection: { status: 1, _id: 1, 'tradeAndCargoSnapshot.trade._id': 1 },
      options: { sort: { source: '-1', 'data.sourceId': '1' } }
    }
    const query = stringify(filter)

    it('returns trades', async () => {
      expect(await controller.find(query)).toEqual({
        items: [MOCK_DATA_WITH_SOURCE_ID],
        limit: 100,
        skip: 0,
        total: 1
      })
    })

    it('retrow error', async () => {
      mockTradeAgent.find = jest.fn().mockReturnValueOnce(Promise.reject({ error: 'error' }))
      await expect(controller.find(query)).rejects.toMatchObject({
        error: 'error'
      })
    })
  })

  describe('.create', () => {
    it('returns an id', async () => {
      mockTradeAgent.count = jest.fn().mockReturnValue(0)

      const result = await controller.create(MOCK_DATA)

      expect(result).toEqual(
        expect.objectContaining({
          _id: MOCK_ID,
          source: MOCK_DATA.source
        })
      )
    })

    it('creates trade with sourceId generated ', async () => {
      mockTradeAgent.count = jest.fn().mockReturnValue(0)
      const mockData = { ...MOCK_DATA, sourceId: undefined }

      expect(await controller.create(mockData)).toEqual(
        expect.objectContaining({
          _id: MOCK_ID,
          source: MOCK_DATA.source
        })
      )

      const object = mockCreateTrade.mock.calls[0][0]
      expect(validator.isUUID(object.sourceId)).toBeTruthy()
    })

    it('returns an invalidRequestException if invalid data', async () => {
      const mockData = {
        ...MOCK_DATA,
        source: null
      }

      mockTradeValidator.validate.mockReturnValueOnce({ errors: 'error' })

      const result = controller.create(mockData)
      await expect(result).rejects.toMatchObject({ status: 400 })
    })

    it('should add a creditRequirement to a trade if not present', async () => {
      const tradeData = { ...MOCK_DATA }
      delete tradeData.creditRequirement
      const createCall = jest.spyOn(mockTradeAgent, 'create')
      mockTradeAgent.count = jest.fn().mockReturnValue(0)

      expect(await controller.create(MOCK_DATA)).toEqual(
        expect.objectContaining({
          _id: MOCK_ID,
          source: MOCK_DATA.source
        })
      )
      expect(createCall).toBeCalledWith(
        expect.objectContaining({
          creditRequirement: CreditRequirements.DocumentaryLetterOfCredit
        })
      )
    })
  })

  describe('.get', () => {
    it('returns a trade', async () => {
      expect(await controller.get(MOCK_ID)).toEqual(MOCK_DATA_WITH_SOURCE_ID)
    })
  })

  describe('.delete', () => {
    it('delete a trade', done => {
      mockTradeFinanceServiceClient.getTradeFinanceServiceClient = jest.fn().mockReturnValue(null)
      return controller.delete(MOCK_ID).then(() => done())
    })

    it('exists LC', async () => {
      mockTradeFinanceServiceClient.getTradeFinanceServiceClient = jest.fn().mockReturnValue(MOCK_DATA_LC)
      const result = controller.delete(MOCK_ID)
      await expect(result).rejects.toMatchObject({
        status: 409,
        message: "You can't remove trade 3ea30520n42b4n4495n964dn4e63224b8332, trade have a LC document"
      })
    })
  })

  describe('.update', () => {
    it('updates a trade', async () => {
      mockTradeAgent.get = jest.fn().mockReturnValue(MOCK_DATA)
      mockTradeAgent.update = jest.fn().mockReturnValueOnce(MOCK_DATA_UPDATED)
      const newTrade: ITrade = { ...buildFakeTrade(), ...MOCK_DATA }
      await controller.update(MOCK_ID, newTrade)
      expect(mockTradeAgent.update).toHaveBeenCalled()

      expect(mockTradeUpdateMessageUseCase.execute).toBeCalledTimes(1)
      expect(mockTradeUpdateMessageUseCase.execute).toBeCalledWith(MOCK_DATA, MOCK_DATA_UPDATED)
    })

    it('updates a trade if the buyerEtrm is added by update', async () => {
      const newTrade: ITrade = {
        ...buildFakeTrade(),
        ...MOCK_DATA,
        buyerEtrmId: '123'
      }
      const existingTrade: ITrade = { ...buildFakeTrade(), ...MOCK_DATA }
      existingTrade.buyerEtrmId = null

      mockTradeAgent.get = jest.fn().mockReturnValue(existingTrade)
      mockTradeAgent.update = jest.fn().mockReturnValueOnce(newTrade)
      mockTradeAgent.find = jest.fn().mockReturnValue([])

      await controller.update(MOCK_ID, newTrade)

      expect(mockTradeAgent.update).toHaveBeenCalled()
      expect(mockTradeUpdateMessageUseCase.execute).toBeCalledTimes(1)
      expect(mockTradeUpdateMessageUseCase.execute).toBeCalledWith(existingTrade, newTrade)
    })

    it('updates a trade if the buyerEtrm changes', async () => {
      const newTrade: ITrade = {
        ...buildFakeTrade(),
        ...MOCK_DATA,
        buyerEtrmId: '123'
      }
      const existingTrade: ITrade = {
        ...buildFakeTrade(),
        ...MOCK_DATA,
        buyerEtrmId: '567'
      }
      mockTradeAgent.get = jest.fn().mockReturnValue(existingTrade)
      mockTradeAgent.update = jest.fn().mockReturnValueOnce(newTrade)
      mockTradeAgent.find = jest.fn().mockReturnValue([])

      await controller.update(MOCK_ID, newTrade)

      expect(mockTradeAgent.update).toHaveBeenCalled()
      expect(mockTradeUpdateMessageUseCase.execute).toBeCalledTimes(1)
      expect(mockTradeUpdateMessageUseCase.execute).toBeCalledWith(existingTrade, newTrade)
    })

    it('updates a trade if the buyerEtrm is added as null but exists as empty string in the existing trade', async () => {
      const newTrade: ITrade = {
        ...buildFakeTrade(),
        ...MOCK_DATA,
        buyerEtrmId: null
      }
      const existingTrade: ITrade = {
        ...buildFakeTrade(),
        ...MOCK_DATA,
        buyerEtrmId: ''
      }
      mockTradeAgent.get = jest.fn().mockReturnValue(existingTrade)
      mockTradeAgent.update = jest.fn().mockReturnValueOnce(newTrade)
      mockTradeAgent.find = jest.fn().mockReturnValue([])

      await controller.update(MOCK_ID, newTrade)

      expect(mockTradeAgent.update).toHaveBeenCalled()
      expect(mockTradeUpdateMessageUseCase.execute).toBeCalledTimes(1)
      expect(mockTradeUpdateMessageUseCase.execute).toBeCalledWith(existingTrade, newTrade)
    })

    it('updates a trade if the buyerEtrm is added as empty string but is undefined in the existing trade', async () => {
      const newTrade = { ...MOCK_DATA_WITH_SOURCE_ID, buyerEtrmId: null }
      const existingTrade = { ...MOCK_DATA_WITH_SOURCE_ID }
      delete existingTrade.buyerEtrmId

      await runEtrmHasNotChangedTest(newTrade, existingTrade)
    })

    it('updates a trade if the sellerEtrmId changes', async () => {
      const newTrade: ITrade = {
        ...buildFakeTrade(),
        ...MOCK_DATA,
        sellerEtrmId: '123'
      }
      const existingTrade: ITrade = {
        ...buildFakeTrade(),
        ...MOCK_DATA,
        sellerEtrmId: '567'
      }

      mockTradeAgent.get = jest
        .fn()
        .mockReturnValueOnce(existingTrade)
        .mockReturnValueOnce(newTrade)
      mockTradeAgent.find = jest.fn().mockReturnValue([])
      mockTradeAgent.update = jest.fn().mockReturnValueOnce(newTrade)

      await controller.update(MOCK_ID, newTrade)

      expect(mockTradeAgent.find).toHaveBeenCalled()
      expect(mockTradeAgent.update).toHaveBeenCalled()
      expect(mockTradeUpdateMessageUseCase.execute).toBeCalledTimes(1)
      expect(mockTradeUpdateMessageUseCase.execute).toBeCalledWith(existingTrade, newTrade)
    })

    it('updates a trade if the sellerEtrmId is added as null but exists as empty string in the existing trade', async () => {
      const newTrade = { ...MOCK_DATA_WITH_SOURCE_ID, sellerEtrmId: null }
      const existingTrade = { ...MOCK_DATA_WITH_SOURCE_ID, sellerEtrmId: '' }

      await runEtrmHasNotChangedTest(newTrade, existingTrade)
    })

    it('updates a trade if the sellerEtrmId is added as empty string but is undefined in the existing trade', async () => {
      const newTrade = { ...MOCK_DATA_WITH_SOURCE_ID, sellerEtrmId: null }
      const existingTrade = { ...MOCK_DATA_WITH_SOURCE_ID }
      delete existingTrade.sellerEtrmId
      await runEtrmHasNotChangedTest(newTrade, existingTrade)
    })

    it('returns error if a trade exists with the same buyerEtrmId', async () => {
      const tradeInDb: ITrade = {
        ...buildFakeTrade(),
        ...MOCK_DATA,
        sellerEtrmId: '',
        buyerEtrmId: '123'
      }
      const updateTradeReq: ITrade = {
        ...buildFakeTrade(),
        ...MOCK_DATA,
        sellerEtrmId: '',
        buyerEtrmId: '456'
      }
      const sameEtrmIdTrade: ITrade = {
        ...buildFakeTrade(),
        ...MOCK_DATA,
        sellerEtrmId: '',
        buyerEtrmId: '456'
      }

      mockTradeAgent.get = jest.fn().mockReturnValue(tradeInDb)
      mockTradeAgent.find = jest.fn().mockReturnValue([sameEtrmIdTrade])

      const result = controller.update(MOCK_ID, updateTradeReq)

      await expect(result).rejects.toMatchObject({
        status: 409,
        message: `Trade with the same Buyer EtrmID already exists. EtrmId: ${sameEtrmIdTrade.buyerEtrmId}`
      })
      expect(mockTradeUpdateMessageUseCase.execute).toBeCalledTimes(0)
    })

    it('returns errora trade exists with the same sellerEtrmId', async () => {
      const tradeInDb: ITrade = {
        ...buildFakeTrade(),
        ...MOCK_DATA,
        buyerEtrmId: '',
        sellerEtrmId: '123'
      }
      const updateTradeReq: ITrade = {
        ...buildFakeTrade(),
        ...MOCK_DATA,
        buyerEtrmId: '',
        sellerEtrmId: '456'
      }
      const sameEtrmIdTrade: ITrade = {
        ...buildFakeTrade(),
        ...MOCK_DATA,
        buyerEtrmId: '',
        sellerEtrmId: '456'
      }

      mockTradeAgent.get = jest.fn().mockReturnValue(tradeInDb)
      mockTradeAgent.find = jest.fn().mockReturnValue([sameEtrmIdTrade])

      const result = controller.update(MOCK_ID, updateTradeReq)

      await expect(result).rejects.toMatchObject({
        status: 409,
        message: `Trade with the same Seller EtrmID already exists. EtrmId: ${sameEtrmIdTrade.sellerEtrmId}`
      })
      expect(mockTradeUpdateMessageUseCase.execute).toBeCalledTimes(0)
    })

    it('returns error if source changed', async () => {
      const newTrade: ITrade = {
        ...buildFakeTrade(),
        ...MOCK_DATA,
        source: TradeSource.Vakt
      }
      const result = controller.update(MOCK_ID, newTrade)
      await expect(result).rejects.toMatchObject({
        status: 400,
        message: "Can't change trade: source",
        errorObject: { fields: { source: ['Current: KOMGO, new: VAKT'] } }
      })
    })

    it('should ignore sourceId in request', async () => {
      mockTradeAgent.get = jest.fn().mockReturnValue(MOCK_DATA_WITH_SOURCE_ID)
      mockTradeAgent.update = jest.fn().mockReturnValue(MOCK_DATA_WITH_SOURCE_ID_UPDATED)

      const result = await controller.update(MOCK_ID, {
        ...MOCK_DATA,
        sourceId: '0000'
      } as any)

      expect(mockTradeAgent.update).toBeCalledWith(
        MOCK_ID,
        expect.objectContaining({
          sourceId: MOCK_DATA_WITH_SOURCE_ID.sourceId
        })
      )
      expect(mockTradeUpdateMessageUseCase.execute).toBeCalledTimes(1)
      expect(mockTradeUpdateMessageUseCase.execute).toBeCalledWith(
        MOCK_DATA_WITH_SOURCE_ID,
        MOCK_DATA_WITH_SOURCE_ID_UPDATED
      )
    })

    it('returns 400 if validation fails', async () => {
      const newTrade: ITrade = {
        ...buildFakeTrade(),
        ...MOCK_DATA,
        source: TradeSource.Vakt
      }
      mockTradeValidator.validate.mockReturnValueOnce({ error: 'error' })
      const result = controller.update(MOCK_ID, newTrade)
      await expect(result).rejects.toMatchObject({ status: 400 })

      expect(mockTradeUpdateMessageUseCase.execute).toBeCalledTimes(0)
    })

    it('returns 404 if no trade', async () => {
      const newTrade: ITrade = {
        ...buildFakeTrade(),
        ...MOCK_DATA,
        source: TradeSource.Vakt
      }
      mockTradeAgent.get = jest.fn().mockReturnValueOnce(null)

      const result = controller.update(MOCK_ID, newTrade)
      await expect(result).rejects.toMatchObject({ status: 404 })

      expect(mockTradeUpdateMessageUseCase.execute).toBeCalledTimes(0)
    })

    it('should add a creditRequirement to a trade if not present', async () => {
      const tradeData: ITrade = { ...buildFakeTrade(), ...MOCK_DATA }
      delete tradeData.creditRequirement
      const updateCall = jest.spyOn(mockTradeAgent, 'update')
      mockTradeAgent.count = jest.fn().mockReturnValue(0)
      mockTradeAgent.get = jest.fn().mockReturnValueOnce({ ...tradeData })
      updateCall.mockReturnValueOnce({
        ...tradeData,
        creditRequirement: CreditRequirements.DocumentaryLetterOfCredit
      })

      await controller.update(MOCK_ID, tradeData)

      expect(updateCall).toBeCalledWith(
        MOCK_ID,
        expect.objectContaining({
          creditRequirement: CreditRequirements.DocumentaryLetterOfCredit
        })
      )
      expect(mockTradeUpdateMessageUseCase.execute).toBeCalledTimes(1)
      expect(mockTradeUpdateMessageUseCase.execute).toBeCalledWith(
        tradeData,
        expect.objectContaining({
          ...tradeData,
          creditRequirement: CreditRequirements.DocumentaryLetterOfCredit
        })
      )
    })
  })

  describe('.update seller', () => {
    beforeEach(() => {
      mockTradeAgent = {
        create: mockCreateTrade,
        get: jest.fn(
          (): ITrade => ({
            ...buildFakeTrade({
              status: ReceivableDiscountStatus.ToBeDiscounted,
              buyer: BUYER,
              seller: SELLER
            }),
            sourceId: 'E2939jgvai90je'
          })
        ),
        find: jest.fn().mockReturnValue([]),
        count: jest.fn().mockReturnValue(1),
        update: jest.fn().mockReturnValue(Promise.resolve()),
        delete: jest.fn(),
        findOne: jest.fn()
      }
      mockTradeValidator.validate.mockReset()
      tradeValidationService = new TradeValidationService(mockTradeAgent, mockTradeValidator, MOCK_DATA_SELLER.seller)
      controller = new TradeController(
        mockTradeAgent as any,
        mockCargoAgent,
        tradeValidationService,
        mockTradeFinanceServiceClient,
        mockTradeUpdateMessageUseCase,
        SELLER
      )
    })
    it('updates a trade', async () => {
      const newTrade: ITrade = {
        ...buildFakeTrade(),
        ...MOCK_DATA_SELLER,
        source: TradeSource.Vakt,
        status: ReceivableDiscountStatus.ToBeDiscounted
      }
      mockTradeAgent.get = jest.fn().mockReturnValue({ ...newTrade })
      newTrade.price = 1111 // change some value

      await controller.update(MOCK_ID, newTrade)
      expect(mockTradeAgent.update).toHaveBeenCalled()
      expect(mockTradeUpdateMessageUseCase.execute).toBeCalledTimes(1)
    })

    it('returns 400 if validation fails', async () => {
      const newTrade: ITrade = {
        ...buildFakeTrade(),
        ...MOCK_DATA_SELLER,
        source: TradeSource.Vakt,
        seller: 'node.999',
        creditRequirement: CreditRequirements.StandbyLetterOfCredit,
        commodity: 'new_commodity',
        status: ReceivableDiscountStatus.ToBeDiscounted
      }
      mockTradeValidator.validate.mockReturnValueOnce({ error: 'error' })
      const result = controller.update(MOCK_ID, newTrade)
      await expect(result).rejects.toMatchObject({ status: 400 })
      expect(mockTradeUpdateMessageUseCase.execute).toBeCalledTimes(0)
    })

    it('returns error if fields changed', async () => {
      const newTrade: ITrade = {
        ...buildFakeTrade(),
        ...MOCK_DATA_SELLER,
        source: TradeSource.Vakt,
        seller: 'node.999',
        creditRequirement: CreditRequirements.StandbyLetterOfCredit,
        commodity: 'new_commodity',
        status: ReceivableDiscountStatus.ToBeDiscounted
      }

      const result = controller.update(MOCK_ID, newTrade)
      await expect(result).rejects.toMatchObject({
        status: 400,
        message: "Can't change trade: source,seller,creditRequirement,commodity",
        errorObject: {
          fields: {
            source: ['Current: KOMGO, new: VAKT'],
            seller: [`Current: ${SELLER}, new: node.999`],
            creditRequirement: ['Current: DOCUMENTARY_LETTER_OF_CREDIT, new: STANDBY_LETTER_OF_CREDIT'],
            commodity: ['Current: CRUDE_OIL, new: new_commodity']
          }
        }
      })
    })
  })

  describe('.fetchMovements', () => {
    it('return the trade movements', async () => {
      const req = new MockRequest({
        query: {}
      })

      expect(await controller.fetchMovements(req, '1')).toEqual([MOCK_DATA_CARGO])
    })

    it('return the trade movements without filter', async () => {
      const req = new MockRequest()

      expect(await controller.fetchMovements(req, '1')).toEqual([MOCK_DATA_CARGO])
    })

    it('return the trade movements with vaktId', async () => {
      const req = new MockRequest()

      expect(await controller.fetchMovements(req, '1')).toEqual([MOCK_DATA_CARGO])
      expect(mockCargoAgent.find).toBeCalledWith(
        { sourceId: MOCK_DATA_WITH_SOURCE_ID.sourceId },
        undefined,
        expect.anything()
      )
    })
  })

  async function runEtrmHasNotChangedTest(newTrade: ITrade, existingTrade: ITrade) {
    mockTradeAgent.get = jest.fn().mockReturnValueOnce(existingTrade)
    mockTradeAgent.update = jest.fn().mockReturnValueOnce(newTrade)
    mockTradeAgent.find = jest.fn()
    await controller.update(MOCK_ID, newTrade)

    expect(mockTradeAgent.update).toHaveBeenCalled()
    expect(mockTradeAgent.find).not.toHaveBeenCalled()

    expect(mockTradeUpdateMessageUseCase.execute).toBeCalledTimes(1)
    expect(mockTradeUpdateMessageUseCase.execute).toBeCalledWith(existingTrade, newTrade)
  }
})
