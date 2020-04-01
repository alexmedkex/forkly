import 'reflect-metadata'

import { buildFakeTrade, ITrade } from '@komgo/types'

import { TradeUpdateMessageUseCase } from './TradeUpdateMessageUseCase'
import { EventMessagePublisher } from '../service-layer/events/EventMessagePublisher'
import createMockInstance from 'jest-create-mock-instance'

let mockEventMessagePublisher: EventMessagePublisher

const MOCK_DATA: ITrade = buildFakeTrade()

describe('TradeUpdateMessageUseCase', () => {
  let tradeUpdateMessageUseCase: TradeUpdateMessageUseCase

  beforeEach(() => {
    mockEventMessagePublisher = createMockInstance(EventMessagePublisher)
    tradeUpdateMessageUseCase = new TradeUpdateMessageUseCase(mockEventMessagePublisher)
  })

  it('should not publish message if ITrade is the same', async () => {
    const oldTrade: ITrade = { ...MOCK_DATA }
    const newTrade: ITrade = { ...MOCK_DATA }

    await tradeUpdateMessageUseCase.execute(oldTrade, newTrade)

    expect(mockEventMessagePublisher.publishTradeUpdated).toBeCalledTimes(0)
  })

  it('should publish message if ITrade is different', async () => {
    const oldTrade: ITrade = { ...MOCK_DATA, price: Date.now() }
    const newTrade: ITrade = { ...MOCK_DATA }

    await tradeUpdateMessageUseCase.execute(oldTrade, newTrade)

    expect(mockEventMessagePublisher.publishTradeUpdated).toBeCalledTimes(1)
    expect(mockEventMessagePublisher.publishTradeUpdated).toBeCalledWith(newTrade)
  })

  it('should not publish message if only updateAt is different ', async () => {
    const oldTrade: ITrade = { ...MOCK_DATA }
    const newTrade: ITrade = { ...MOCK_DATA, updatedAt: '2001-01-02' }

    await tradeUpdateMessageUseCase.execute(oldTrade, newTrade)

    expect(mockEventMessagePublisher.publishTradeUpdated).toBeCalledTimes(0)
  })
})
