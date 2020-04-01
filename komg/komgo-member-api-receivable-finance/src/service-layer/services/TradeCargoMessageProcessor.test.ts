import { ITradeMessage, TradeCargoRoutingKey, ICargoMessage } from '@komgo/messaging-types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { InvalidPayloadProcessingError } from '../../business-layer/errors'
import { ReceiveTradeUseCase, ReceiveCargoUseCase } from '../../business-layer/trade-cargo/use-cases'

import { TradeCargoMessageProcessor } from './TradeCargoMessageProcessor'

const mockAck = jest.fn()
const mockReject = jest.fn()
const mockRequeue = jest.fn()

describe('TradeCargoMessageProcessor', () => {
  let tradeCargoMessageProcessor: TradeCargoMessageProcessor
  let mockReceiveTradeUseCase: jest.Mocked<ReceiveTradeUseCase>
  let mockReceiveCargoUseCase: jest.Mocked<ReceiveCargoUseCase>

  let mockTradeMessage: ITradeMessage
  let mockCargoMessage: ICargoMessage

  beforeEach(() => {
    mockReceiveTradeUseCase = createMockInstance(ReceiveTradeUseCase)
    mockReceiveCargoUseCase = createMockInstance(ReceiveCargoUseCase)
    mockTradeMessage = {
      trade: { sourceId: 'sourceId' }
    }
    mockCargoMessage = {
      cargo: { _id: '_id222' }
    }

    tradeCargoMessageProcessor = new TradeCargoMessageProcessor(mockReceiveTradeUseCase, mockReceiveCargoUseCase)
  })

  describe('ReceiveTradeUseCase', () => {
    it('should execute the returned usecase and ack the message', async () => {
      const message = createMessageReceived(mockTradeMessage, TradeCargoRoutingKey.TradeUpdated)

      await tradeCargoMessageProcessor.process(message)

      expect(message.ack).toBeCalledTimes(1)
      expect(message.reject).toBeCalledTimes(0)
      expect(message.requeue).toBeCalledTimes(0)
      expect(mockReceiveTradeUseCase.execute).toBeCalledTimes(1)
      expect(mockReceiveTradeUseCase.execute).toBeCalledWith(message.content)
    })

    it('should reject the message when the Routing key is not supported', async () => {
      const message = createMessageReceived(mockTradeMessage, 'Some.routing.key')

      await tradeCargoMessageProcessor.process(message)

      expect(message.ack).toBeCalledTimes(0)
      expect(message.reject).toBeCalledTimes(1)
      expect(message.requeue).toBeCalledTimes(0)
      expect(mockReceiveTradeUseCase.execute).toBeCalledTimes(0)
    })

    it('should throw InvalidPayloadProcessingError if message doesnt have a trade', async () => {
      const message = createMessageReceived(mockTradeMessage, TradeCargoRoutingKey.TradeUpdated)
      message.content.trade = undefined

      await expect(tradeCargoMessageProcessor.process(message)).rejects.toThrowError(InvalidPayloadProcessingError)

      expect(message.ack).toBeCalledTimes(0)
      expect(message.reject).toBeCalledTimes(0)
      expect(message.requeue).toBeCalledTimes(0)
      expect(mockReceiveTradeUseCase.execute).toBeCalledTimes(0)
    })
  })

  describe('ReceiveCargoUseCase', () => {
    it('should execute the returned usecase and ack the message', async () => {
      const message = createMessageReceived(mockCargoMessage, TradeCargoRoutingKey.CargoUpdated)

      await tradeCargoMessageProcessor.process(message)

      expect(message.ack).toBeCalledTimes(1)
      expect(message.reject).toBeCalledTimes(0)
      expect(message.requeue).toBeCalledTimes(0)
      expect(mockReceiveCargoUseCase.execute).toBeCalledTimes(1)
      expect(mockReceiveCargoUseCase.execute).toBeCalledWith(message.content)
    })

    it('should reject the message when the Routing key is not supported', async () => {
      const message = createMessageReceived(mockCargoMessage, 'Some.routing.key')

      await tradeCargoMessageProcessor.process(message)

      expect(message.ack).toBeCalledTimes(0)
      expect(message.reject).toBeCalledTimes(1)
      expect(message.requeue).toBeCalledTimes(0)
      expect(mockReceiveCargoUseCase.execute).toBeCalledTimes(0)
    })

    it('should throw InvalidPayloadProcessingError if message doesnt have a a cargo', async () => {
      const message = createMessageReceived(mockCargoMessage, TradeCargoRoutingKey.CargoUpdated)
      message.content.cargo = undefined

      await expect(tradeCargoMessageProcessor.process(message)).rejects.toThrowError(InvalidPayloadProcessingError)

      expect(message.ack).toBeCalledTimes(0)
      expect(message.reject).toBeCalledTimes(0)
      expect(message.requeue).toBeCalledTimes(0)
      expect(mockReceiveCargoUseCase.execute).toBeCalledTimes(0)
    })
  })

  function createMessageReceived<T>(updateMessage: any, routingKey: string) {
    return {
      content: updateMessage,
      routingKey,
      options: {
        messageId: 'messageId'
      },
      ack: mockAck,
      reject: mockReject,
      requeue: mockRequeue
    }
  }
})
