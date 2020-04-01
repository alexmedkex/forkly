import 'reflect-metadata'
import createMockInstance from 'jest-create-mock-instance'

import { trade } from '../messaging/mock-data/mock-lc'
import { ISBLCDataAgent, ILCCacheDataAgent, LCCacheDataAgent } from '../../data-layer/data-agents'
import { ITradeCargoClient } from './ITradeCargoClient'
import { TradeInstrumentValidationService } from './TradeInstrumentValidationService'

let sblcDataAgent: ISBLCDataAgent
let lcCacheDataAgent: ILCCacheDataAgent
let tradeCargoClient: ITradeCargoClient

let service: TradeInstrumentValidationService

const TRADE_ID = 'some-trade-id'

describe('TradeInstrumentValidationService', () => {
  beforeEach(() => {
    sblcDataAgent = {
      getByContractAddress: jest.fn(),
      save: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
      get: jest.fn(),
      getNonce: jest.fn(),
      count: jest.fn()
    }
    lcCacheDataAgent = createMockInstance(LCCacheDataAgent)
    lcCacheDataAgent.getLC = jest.fn().mockResolvedValue(null)
    tradeCargoClient = {
      getTrade: jest.fn().mockImplementation(() => trade),
      getCargoByTrade: jest.fn(),
      getTradeByVakt: jest.fn(),
      getTradeAndCargoBySourceAndSourceId: jest.fn()
    }

    service = new TradeInstrumentValidationService(sblcDataAgent, lcCacheDataAgent, tradeCargoClient)
  })

  it('should validate application', async () => {
    expect(await service.validateById(TRADE_ID)).toBeTruthy()
    expect(tradeCargoClient.getTrade).toBeCalledWith(TRADE_ID)
    expect(lcCacheDataAgent.getLC).toBeCalledWith(
      expect.objectContaining({
        'tradeAndCargoSnapshot.source': trade.source,
        'tradeAndCargoSnapshot.sourceId': trade.sourceId
      })
    )
    expect(sblcDataAgent.find).toBeCalledWith(
      expect.objectContaining({
        'tradeId.source': trade.source,
        'tradeId.sourceId': trade.sourceId
      })
    )
  })

  it('should fail to validate - lc exists', async () => {
    lcCacheDataAgent.getLC = jest.fn().mockResolvedValue({ _id: '1' })
    expect(await service.validateById(TRADE_ID)).toBeFalsy()
    expect(lcCacheDataAgent.getLC).toBeCalledWith(
      expect.objectContaining({
        'tradeAndCargoSnapshot.source': trade.source,
        'tradeAndCargoSnapshot.sourceId': trade.sourceId
      })
    )
  })

  it('should fail to validate - sblc exists', async () => {
    sblcDataAgent.find = jest.fn().mockResolvedValue([{ _id: '1' }])
    expect(await service.validateById(TRADE_ID)).toBeFalsy()
    expect(sblcDataAgent.find).toBeCalledWith(
      expect.objectContaining({
        'tradeId.source': trade.source,
        'tradeId.sourceId': trade.sourceId
      })
    )
  })
})
