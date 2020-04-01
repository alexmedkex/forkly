import { IMessageReceived } from '@komgo/messaging-library'
import {
  buildFakeDocumentReceivedMessage,
  IDocumentReceivedMessage,
  buildFakeDocumentReceived
} from '@komgo/messaging-types'
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import { DocumentReceivedUseCase } from '../../business-layer/documents/use-cases'
import { InvalidPayloadProcessingError } from '../../business-layer/errors'

import { DocumentMessageProcessor } from './DocumentMessageProcessor'

describe('DocumentMessageProcessor', () => {
  let documentMessageProcessor: DocumentMessageProcessor
  let mockDocumentsReceivedUseCase: jest.Mocked<DocumentReceivedUseCase>
  let msg: IMessageReceived
  let content: IDocumentReceivedMessage
  let mockAck
  let mockReject
  let mockRequeue

  beforeEach(() => {
    mockAck = jest.fn()
    mockReject = jest.fn()
    mockRequeue = jest.fn()
    mockDocumentsReceivedUseCase = createMockInstance(DocumentReceivedUseCase)
    documentMessageProcessor = new DocumentMessageProcessor(mockDocumentsReceivedUseCase)
    msg = createMessageReceived<IDocumentReceivedMessage>(
      buildFakeDocumentReceivedMessage({ documents: [buildFakeDocumentReceived({ context: { rdId: 'rd-id' } })] }),
      'INTERNAL.DOCUMENT.DocumentReceived.tradeFinance.rd'
    )
    content = msg.content as IDocumentReceivedMessage
  })

  it('should successfully process message with trade and rd documents', async () => {
    content.documents = [
      buildFakeDocumentReceived({ context: { subProductId: 'rd', rdId: 'rdId' } }),
      buildFakeDocumentReceived({ context: { subProductId: 'trade', vaktId: 'vaktId' } })
    ]
    await documentMessageProcessor.process(msg)

    expect(mockAck).toHaveBeenCalled()
    expect(mockDocumentsReceivedUseCase.execute).toHaveBeenCalledWith(msg.content)
  })

  it('should successfully process message with LC document', async () => {
    content.documents = [buildFakeDocumentReceived({ context: { subProductId: 'lc', vaktId: 'vaktId' } })]
    await documentMessageProcessor.process(msg)

    expect(mockAck).toHaveBeenCalled()
    expect(mockDocumentsReceivedUseCase.execute).toHaveBeenCalledWith(msg.content)
  })

  describe('Failure', () => {
    it('should throw an InvalidPayloadProcessingError for an invalid routing key', async () => {
      msg.routingKey = 'INTERNAL.RFP'

      const promise = documentMessageProcessor.process(msg)

      expect(mockDocumentsReceivedUseCase.execute).not.toHaveBeenCalled()
      await expect(promise).rejects.toThrowError(InvalidPayloadProcessingError)
      await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"Unsupported routing key"`)
    })

    it('should throw an InvalidPayloadProcessingError if there is no context', async () => {
      delete content.context

      const promise = documentMessageProcessor.process(msg)

      expect(mockDocumentsReceivedUseCase.execute).not.toHaveBeenCalled()
      await expect(promise).rejects.toThrowError(InvalidPayloadProcessingError)
      await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"Message content is invalid"`)
    })

    it('should throw an InvalidPayloadProcessingError if there is no product ID', async () => {
      delete content.context.productId

      const promise = documentMessageProcessor.process(msg)

      expect(mockDocumentsReceivedUseCase.execute).not.toHaveBeenCalled()
      await expect(promise).rejects.toThrowError(InvalidPayloadProcessingError)
      await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"Message content is invalid"`)
    })

    it('should throw an InvalidPayloadProcessingError if there are no documents', async () => {
      content.documents = []

      const promise = documentMessageProcessor.process(msg)

      expect(mockDocumentsReceivedUseCase.execute).not.toHaveBeenCalled()
      await expect(promise).rejects.toThrowError(InvalidPayloadProcessingError)
      await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"Message content is invalid"`)
    })

    it('should throw an InvalidPayloadProcessingError if there is no sender static ID', async () => {
      delete content.senderStaticId

      const promise = documentMessageProcessor.process(msg)

      expect(mockDocumentsReceivedUseCase.execute).not.toHaveBeenCalled()
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
