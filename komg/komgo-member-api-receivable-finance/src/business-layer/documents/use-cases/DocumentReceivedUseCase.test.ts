import {
  IDocumentReceivedMessage,
  buildFakeDocumentReceivedMessage,
  buildFakeDocumentReceived
} from '@komgo/messaging-types'
import { tradeFinanceManager } from '@komgo/permissions'
import { buildFakeReceivablesDiscountingExtended } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'

import { ReceivablesDiscountingDataAgent } from '../../../data-layer/data-agents'
import { NotificationClient } from '../../microservice-clients'

import { DocumentReceivedUseCase } from './DocumentReceivedUseCase'

describe('DocumentReceivedUseCase', () => {
  let content: IDocumentReceivedMessage
  let useCase: DocumentReceivedUseCase
  let mockNotificationClient: jest.Mocked<NotificationClient>
  let mockRdDataAgent: jest.Mocked<ReceivablesDiscountingDataAgent>

  beforeEach(() => {
    content = buildFakeDocumentReceivedMessage()
    mockNotificationClient = createMockInstance(NotificationClient)
    mockRdDataAgent = createMockInstance(ReceivablesDiscountingDataAgent)
    useCase = new DocumentReceivedUseCase(mockNotificationClient, mockRdDataAgent)
  })

  it('should skip any rd or trade documents for which an rd is not found', async () => {
    const rd = buildFakeReceivablesDiscountingExtended()
    content.documents = [
      buildFakeDocumentReceived({ context: { subProductId: 'trade', vaktId: 'vaktId' } }),
      buildFakeDocumentReceived({ context: { subProductId: 'rd', rdId: 'rdId' } }),
      buildFakeDocumentReceived({ context: { subProductId: 'rd', rdId: 'rdId2' } })
    ]
    mockRdDataAgent.findByStaticId
      .mockResolvedValueOnce(rd)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)

    await useCase.execute(content)

    expect(mockNotificationClient.createDocumentReceivedNotification).toHaveBeenCalledTimes(1)
    expect(mockNotificationClient.sendNotification).toHaveBeenCalledTimes(1)
  })

  it('should skip any non RD or Trade documents', async () => {
    content.documents = [buildFakeDocumentReceived({ context: { subProductId: 'lc' } })]

    await useCase.execute(content)

    expect(mockNotificationClient.createDocumentReceivedNotification).not.toHaveBeenCalled()
    expect(mockNotificationClient.sendNotification).not.toHaveBeenCalled()
  })

  it('should skip documents without a context', async () => {
    content.documents = [buildFakeDocumentReceived({ context: null })]

    await useCase.execute(content)

    expect(mockNotificationClient.createDocumentReceivedNotification).not.toHaveBeenCalled()
    expect(mockNotificationClient.sendNotification).not.toHaveBeenCalled()
  })

  it('should send a notification for a trade document', async () => {
    const rd = buildFakeReceivablesDiscountingExtended()
    mockRdDataAgent.findByTradeSourceId.mockResolvedValueOnce(rd)
    content.documents = [buildFakeDocumentReceived({ context: { subProductId: 'trade', vaktId: 'vaktId' } })]

    await useCase.execute(content)

    expect(mockRdDataAgent.findByTradeSourceId).toHaveBeenCalledWith('vaktId')
    expect(mockNotificationClient.createDocumentReceivedNotification).toHaveBeenCalledWith(
      rd,
      content.senderStaticId,
      content.documents[0].typeName,
      content.documents[0].context
    )
    expect(mockNotificationClient.sendNotification).toHaveBeenCalled()
  })

  it('should send a notification for an rd document', async () => {
    const rd = buildFakeReceivablesDiscountingExtended()
    mockRdDataAgent.findByStaticId.mockResolvedValueOnce(rd)
    content.documents = [buildFakeDocumentReceived({ context: { subProductId: 'rd', rdId: 'rdId' } })]

    await useCase.execute(content)

    expect(mockRdDataAgent.findByStaticId).toHaveBeenCalledWith('rdId')
    expect(mockNotificationClient.createDocumentReceivedNotification).toHaveBeenCalledWith(
      rd,
      content.senderStaticId,
      content.documents[0].typeName,
      content.documents[0].context
    )
    expect(mockNotificationClient.sendNotification).toHaveBeenCalled()
  })
})
