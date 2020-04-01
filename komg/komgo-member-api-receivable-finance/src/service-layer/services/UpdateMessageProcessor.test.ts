import { buildFakeReceivablesDiscountingExtended } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { InvalidPayloadProcessingError } from '../../business-layer/errors'
import { ReceiveUpdateMessageFactory } from '../../business-layer/messaging'
import { buildFakeReceivableFinanceMessage } from '../../business-layer/messaging/faker'
import { ReceiveRDUpdateUseCase } from '../../business-layer/rd/use-cases'
import { UpdateType, IReceivableFinanceMessage } from '../../business-layer/types'

import { UpdateMessageProcessor } from './UpdateMessageProcessor'

const mockAck = jest.fn()
const mockReject = jest.fn()
const mockRequeue = jest.fn()
const UPDATE_ROUTING_KEY_PREFIX = 'KOMGO.RD.UPDATE'

describe('UpdateMessageProcessor', () => {
  let updateMessageProcessor: UpdateMessageProcessor
  let mockInboundUpdateFactory: jest.Mocked<ReceiveUpdateMessageFactory>
  let mockUseCase: jest.Mocked<ReceiveRDUpdateUseCase>
  let mockUpdateMessage: IReceivableFinanceMessage<any>

  beforeEach(() => {
    mockInboundUpdateFactory = createMockInstance(ReceiveUpdateMessageFactory)
    mockUseCase = createMockInstance(ReceiveRDUpdateUseCase)
    const rd = buildFakeReceivablesDiscountingExtended()
    mockUpdateMessage = buildFakeReceivableFinanceMessage(rd, UpdateType.ReceivablesDiscounting)

    updateMessageProcessor = new UpdateMessageProcessor(mockInboundUpdateFactory)
  })

  it('should ack the message even when it does not find a usecase to process the message', async () => {
    const message = createMessageReceived(
      mockUpdateMessage,
      `${UPDATE_ROUTING_KEY_PREFIX}.${UpdateType.ReceivablesDiscounting}`
    )
    mockInboundUpdateFactory.getUseCase.mockReturnValue(undefined)

    await updateMessageProcessor.process(message)

    expect(mockInboundUpdateFactory.getUseCase).toBeCalledWith(UpdateType.ReceivablesDiscounting)
    expect(message.ack).toBeCalled()
  })

  it('should execute the returned usecase and ack the message', async () => {
    const message = createMessageReceived(
      mockUpdateMessage,
      `${UPDATE_ROUTING_KEY_PREFIX}.${UpdateType.ReceivablesDiscounting}`
    )

    mockInboundUpdateFactory.getUseCase.mockReturnValue(mockUseCase)

    await updateMessageProcessor.process(message)

    expect(mockInboundUpdateFactory.getUseCase).toBeCalledWith(UpdateType.ReceivablesDiscounting)
    expect(mockUseCase.execute).toBeCalledWith(message.content)
    expect(message.ack).toBeCalled()
  })

  it('should reject the message if the routing key is invalid', async () => {
    const message = createMessageReceived(mockUpdateMessage, `invalid.routing.key`)

    mockInboundUpdateFactory.getUseCase.mockReturnValue(mockUseCase)

    await updateMessageProcessor.process(message)

    expect(mockInboundUpdateFactory.getUseCase).not.toBeCalled()
    expect(message.reject).toBeCalled()
  })

  it('should throw an error if message.content is undefined', async () => {
    const message = createMessageReceived(
      mockUpdateMessage,
      `${UPDATE_ROUTING_KEY_PREFIX}.${UpdateType.ReceivablesDiscounting}`
    )
    message.content = undefined

    await expect(updateMessageProcessor.process(message)).rejects.toThrowError(InvalidPayloadProcessingError)
  })

  it('should throw an error if message.content.data is undefined', async () => {
    const message = createMessageReceived(
      mockUpdateMessage,
      `${UPDATE_ROUTING_KEY_PREFIX}.${UpdateType.ReceivablesDiscounting}`
    )
    message.content.data = undefined

    await expect(updateMessageProcessor.process(message)).rejects.toThrowError(InvalidPayloadProcessingError)
  })

  it('should throw an error if message.content.data.entry is undefined', async () => {
    const message = createMessageReceived(
      mockUpdateMessage,
      `${UPDATE_ROUTING_KEY_PREFIX}.${UpdateType.ReceivablesDiscounting}`
    )
    message.content.data.entry = undefined
    mockInboundUpdateFactory.getUseCase.mockReturnValue(mockUseCase)

    await expect(updateMessageProcessor.process(message)).rejects.toThrowError(InvalidPayloadProcessingError)
  })

  function createMessageReceived<T>(updateMessage: IReceivableFinanceMessage<T>, routingKey: string) {
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
