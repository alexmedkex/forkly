import { IMessageReceived } from '@komgo/messaging-library'
import { IReceivablesDiscounting, buildFakeReceivablesDiscountingExtended } from '@komgo/types'
import createMockInstance from 'jest-create-mock-instance'

import { ReceiveAddDiscountingRequestUseCase } from '../../business-layer/add-discounting'
import { InvalidPayloadProcessingError } from '../../business-layer/errors'
import { buildFakeAddDiscountingMessage } from '../../business-layer/messaging/faker'
import { ReceiveAddDiscountingMessageUseCaseFactory } from '../../business-layer/messaging/ReceiveAddDiscountingMessageUseCaseFactory'
import { IReceivableFinanceMessage, IAddDiscountingPayload } from '../../business-layer/types'

import { AddDiscountingMessageProcessor } from './AddDiscountingMessageProcessor'

const mockRD = buildFakeReceivablesDiscountingExtended()

describe('AddDiscountingMessageProcessor', () => {
  let msg: IMessageReceived
  let content: IReceivableFinanceMessage<IAddDiscountingPayload<any>>
  let processor: AddDiscountingMessageProcessor
  let mockReceiveAddDiscountingRequestUseCase: jest.Mocked<ReceiveAddDiscountingRequestUseCase>
  let mockReceiveAddDiscountingMessageUseCaseFactory: jest.Mocked<ReceiveAddDiscountingMessageUseCaseFactory>
  let mockAck
  let mockReject
  let mockRequeue

  beforeEach(() => {
    mockAck = jest.fn()
    mockReject = jest.fn()
    mockRequeue = jest.fn()
    mockReceiveAddDiscountingRequestUseCase = createMockInstance(ReceiveAddDiscountingRequestUseCase)
    mockReceiveAddDiscountingMessageUseCaseFactory = createMockInstance(ReceiveAddDiscountingMessageUseCaseFactory)
    processor = new AddDiscountingMessageProcessor(mockReceiveAddDiscountingMessageUseCaseFactory)
    mockReceiveAddDiscountingMessageUseCaseFactory.getUseCase.mockReturnValueOnce(
      mockReceiveAddDiscountingRequestUseCase
    )

    msg = createMessageReceived<IReceivableFinanceMessage<IAddDiscountingPayload<IReceivablesDiscounting>>>(
      buildFakeAddDiscountingMessage(mockRD.staticId, mockRD),
      'KOMGO.RD.DiscountingRequest.Add'
    )
    content = msg.content as IReceivableFinanceMessage<IAddDiscountingPayload<any>>
  })

  it('should successfully process and execute an Add message', async () => {
    await processor.process(msg)

    expect(mockReceiveAddDiscountingRequestUseCase.execute).toHaveBeenCalledWith(msg.content)
    expect(mockAck).toHaveBeenCalled()
  })

  describe('Failure', () => {
    it('should throw an InvalidPayloadProcessingError for an invalid routing key', async () => {
      msg.routingKey = 'INTERNAL.RFP'

      const promise = processor.process(msg)

      expect(mockReceiveAddDiscountingRequestUseCase.execute).not.toHaveBeenCalled()
      await expect(promise).rejects.toThrowError(InvalidPayloadProcessingError)
      await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"Unsupported routing key"`)
    })

    it('should throw an InvalidPayloadProcessingError if there is no content', async () => {
      delete msg.content

      const promise = processor.process(msg)

      expect(mockReceiveAddDiscountingRequestUseCase.execute).not.toHaveBeenCalled()
      await expect(promise).rejects.toThrowError(InvalidPayloadProcessingError)
      await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"Message payload is invalid"`)
    })

    it('should throw an InvalidPayloadProcessingError if there is no data', async () => {
      delete content.data

      const promise = processor.process(msg)

      expect(mockReceiveAddDiscountingRequestUseCase.execute).not.toHaveBeenCalled()
      await expect(promise).rejects.toThrowError(InvalidPayloadProcessingError)
      await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"Message payload is invalid"`)
    })

    it('should throw an InvalidPayloadProcessingError for DiscountingRequest.Add if there is no entry', async () => {
      delete content.data.entry

      const promise = processor.process(msg)

      expect(mockReceiveAddDiscountingRequestUseCase.execute).not.toHaveBeenCalled()
      await expect(promise).rejects.toThrowError(InvalidPayloadProcessingError)
      await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"Message content is invalid"`)
    })

    it('should throw an InvalidPayloadProcessingError for DiscountingRequest.Add if there is no reply', async () => {
      delete content.data.reply

      const promise = processor.process(msg)

      expect(mockReceiveAddDiscountingRequestUseCase.execute).not.toHaveBeenCalled()
      await expect(promise).rejects.toThrowError(InvalidPayloadProcessingError)
      await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"Message content is invalid"`)
    })
  })

  function createMessageReceived<T extends object>(msgContent: T, routingKey: string) {
    return {
      content: msgContent,
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
