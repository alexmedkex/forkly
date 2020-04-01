import 'reflect-metadata'

import { buildFakeTrade, CreditRequirements, ITrade, TradeSource } from '@komgo/types'

import { TradeValidationService } from './TradeValidationService'
import { ITradeDataAgent } from '../../data-layer/data-agents/ITradeDataAgent'
import { ITradeValidator } from '../../data-layer/validation/TradeValidator'
import { ReceivableDiscountStatus } from '../../data-layer/constants/ReceivableDiscountStatus'

let tradeValidationService: TradeValidationService
let mockTradeAgent: ITradeDataAgent
let mockTradeValidator: ITradeValidator

// const MOCK_ID = '3ea30520n42b4n4495n964dn4e63224b8332'
const MOCK_DATA: ITrade = buildFakeTrade()

const MOCK_TRADE_SELLER = {
  ...MOCK_DATA,
  status: ReceivableDiscountStatus.ToBeDiscounted,
  creditRequirement: CreditRequirements.OpenCredit
}

describe('TradeValidationService', () => {
  describe('.create', () => {
    beforeEach(() => {
      mockTradeAgent = {
        create: jest.fn(),
        get: jest.fn(),
        find: jest.fn().mockReturnValue([]),
        count: jest.fn().mockReturnValue(1),
        update: jest.fn().mockReturnValue(Promise.resolve()),
        delete: jest.fn(),
        findOne: jest.fn()
      }
      mockTradeValidator = {
        validate: jest.fn()
      }
      tradeValidationService = new TradeValidationService(mockTradeAgent, mockTradeValidator, MOCK_DATA.buyer)
    })
    it('should be defined', async () => {
      expect(tradeValidationService).toBeDefined()
    })
    it('returns an invalidRequestException if invalid data', async () => {
      const mockData: ITrade = {
        ...MOCK_DATA
      }
      mockTradeValidator.validate = jest.fn().mockReturnValueOnce({ errors: 'error' })
      const result = tradeValidationService.validateCreate(mockData)
      await expect(result).rejects.toMatchObject({ status: 400 })
    })
  })

  describe('.update', () => {
    beforeEach(() => {
      mockTradeAgent = {
        create: jest.fn(),
        get: jest.fn(),
        find: jest.fn().mockReturnValue([]),
        count: jest.fn().mockReturnValue(1),
        update: jest.fn().mockReturnValue(Promise.resolve()),
        delete: jest.fn(),
        findOne: jest.fn()
      }
      mockTradeValidator = {
        validate: jest.fn()
      }
      tradeValidationService = new TradeValidationService(mockTradeAgent, mockTradeValidator, MOCK_DATA.buyer)
    })

    it('returns 400 if validation fails', async () => {
      const existingTrade = { ...MOCK_DATA }
      const newTrade = { ...MOCK_DATA }
      mockTradeValidator.validate = jest.fn().mockReturnValueOnce({ error: 'error' })
      const result = tradeValidationService.validateUpdate(newTrade, existingTrade)
      await expect(result).rejects.toMatchObject({ status: 400 })
    })

    it('valid update if the buyerEtrm is added as null', async () => {
      const newTrade = { ...MOCK_DATA, buyerEtrmId: null }
      const existingTrade = { ...MOCK_DATA, buyerEtrmId: '' }
      mockTradeAgent.get = jest.fn().mockReturnValue(existingTrade)
      mockTradeAgent.find = jest.fn().mockReturnValue([])
      const result = await tradeValidationService.validateUpdate(newTrade, existingTrade)
      expect(result).toBeTruthy()
    })

    it('valid update if the buyerEtrm is added as empty string', async () => {
      const newTrade = { ...MOCK_DATA, buyerEtrmId: null }
      const existingTrade = { ...MOCK_DATA }
      delete existingTrade.buyerEtrmId
      mockTradeAgent.get = jest.fn().mockReturnValue(existingTrade)
      mockTradeAgent.find = jest.fn()
      const result = await tradeValidationService.validateUpdate(newTrade, existingTrade)
      expect(result).toBeTruthy()
    })

    it('validate update if the sellerEtrmId is added as null', async () => {
      const newTrade = { ...MOCK_DATA, sellerEtrmId: null }
      const existingTrade = { ...MOCK_DATA, sellerEtrmId: '' }
      mockTradeAgent.get = jest.fn().mockReturnValue(existingTrade)
      mockTradeAgent.find = jest.fn()
      const result = await tradeValidationService.validateUpdate(newTrade, existingTrade)
      expect(result).toBeTruthy()
    })

    it('validate update if the sellerEtrmId changes', async () => {
      const newTrade = { ...MOCK_DATA, sellerEtrmId: '123' }
      const existingTrade = { ...MOCK_DATA, sellerEtrmId: '567' }
      mockTradeAgent.get = jest.fn().mockReturnValue(existingTrade)
      mockTradeAgent.find = jest.fn().mockReturnValue([])
      const result = await tradeValidationService.validateUpdate(newTrade, existingTrade)
      expect(result).toBeTruthy()
    })

    it('returns error if a trade exists with the same buyerEtrmId', async () => {
      const existingTrade = { ...MOCK_DATA, sellerEtrmId: '', buyerEtrmId: '123' }
      const newTrade = { ...MOCK_DATA, sellerEtrmId: '', buyerEtrmId: '456' }
      const sameEtrmIdTrade = { ...MOCK_DATA, sellerEtrmId: '', buyerEtrmId: '456' }
      mockTradeAgent.find = jest.fn().mockReturnValue([sameEtrmIdTrade])
      const result = tradeValidationService.validateUpdate(newTrade, existingTrade)
      await expect(result).rejects.toMatchObject({
        status: 409,
        message: `Trade with the same Buyer EtrmID already exists. EtrmId: ${sameEtrmIdTrade.buyerEtrmId}`
      })
    })

    it('returns errora trade exists with the same sellerEtrmId', async () => {
      const existingTrade = { ...MOCK_DATA, buyerEtrmId: '', sellerEtrmId: '123' }
      const newTrade = { ...MOCK_DATA, buyerEtrmId: '', sellerEtrmId: '456' }
      const sameEtrmIdTrade = { ...MOCK_DATA, buyerEtrmId: '', sellerEtrmId: '456' }
      mockTradeAgent.find = jest.fn().mockReturnValue([sameEtrmIdTrade])
      const result = tradeValidationService.validateUpdate(newTrade, existingTrade)
      await expect(result).rejects.toMatchObject({
        status: 409,
        message: `Trade with the same Seller EtrmID already exists. EtrmId: ${sameEtrmIdTrade.sellerEtrmId}`
      })
    })

    it('returns error if source changed', async () => {
      const existingTrade: ITrade = { ...MOCK_DATA, source: TradeSource.Vakt }
      const newTrade: ITrade = { ...MOCK_DATA, source: TradeSource.Komgo }
      const result = tradeValidationService.validateUpdate(newTrade, existingTrade)

      await expect(result).rejects.toMatchObject({
        status: 400,
        errorObject: { fields: { source: ['Current: VAKT, new: KOMGO'] } }
      })
    })
  })

  describe('.update seller', () => {
    beforeEach(() => {
      mockTradeAgent = {
        create: jest.fn(),
        get: jest.fn(),
        find: jest.fn().mockReturnValue([]),
        count: jest.fn().mockReturnValue(1),
        update: jest.fn().mockReturnValue(Promise.resolve()),
        delete: jest.fn(),
        findOne: jest.fn()
      }
      mockTradeValidator = {
        validate: jest.fn()
      }
      tradeValidationService = new TradeValidationService(mockTradeAgent, mockTradeValidator, MOCK_DATA.seller)
    })
    it('valid trade update', async () => {
      const existingTrade = {
        ...MOCK_TRADE_SELLER
      }
      const newTrade = {
        ...MOCK_TRADE_SELLER,
        price: 110
      }
      const result = await tradeValidationService.validateUpdate(newTrade, existingTrade)
      expect(result).toBeTruthy()
    })

    it('invalid status', async () => {
      const existingTrade = {
        ...MOCK_TRADE_SELLER,
        status: 'TO_BE_FINANCED'
      }
      const newTrade = {
        ...MOCK_TRADE_SELLER,
        price: 110
      }
      const result = tradeValidationService.validateUpdate(newTrade, existingTrade)
      await expect(result).rejects.toMatchObject({
        status: 400,
        errorObject: {
          fields: {
            status: [`Can't edit trade in status: TO_BE_FINANCED`]
          }
        }
      })
    })
    it('returns error if fields changed', async () => {
      const existingTrade = {
        ...MOCK_TRADE_SELLER,
        commodity: 'old_commodity'
      }
      const newTrade = {
        ...MOCK_TRADE_SELLER,
        source: TradeSource.Vakt,
        seller: 'node.999',
        creditRequirement: CreditRequirements.StandbyLetterOfCredit,
        commodity: 'new_commodity'
      }
      const result = tradeValidationService.validateUpdate(newTrade, existingTrade)
      await expect(result).rejects.toMatchObject({
        status: 400,
        message: expect.stringMatching(/[creditRequirement][commodity][source][seller]/),
        errorObject: {
          fields: {
            source: ['Current: KOMGO, new: VAKT'],
            seller: ['Current: node.321, new: node.999'],
            creditRequirement: ['Current: OPEN_CREDIT, new: STANDBY_LETTER_OF_CREDIT'],
            commodity: ['Current: old_commodity, new: new_commodity']
          }
        }
      })
    })
  })
})
