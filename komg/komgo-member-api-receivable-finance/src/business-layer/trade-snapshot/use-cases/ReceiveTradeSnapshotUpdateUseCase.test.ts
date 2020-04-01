import { tradeFinanceManager } from '@komgo/permissions'
import {
  buildFakeReceivablesDiscountingExtended,
  ReplyType,
  buildFakeTradeSnapshot,
  ITradeSnapshot
} from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ReceivablesDiscountingDataAgent, TradeSnapshotDataAgent } from '../../../data-layer/data-agents'
import { buildFakeReply } from '../../../data-layer/data-agents/utils/faker'
import { datePlusHours } from '../../../test-utils'
import { InvalidPayloadProcessingError } from '../../errors'
import { buildFakeReceivableFinanceMessage } from '../../messaging/faker'
import { NotificationClient } from '../../microservice-clients'
import { UpdateType } from '../../types'
import { TradeSnapshotValidator } from '../../validation'

import { ReceiveTradeSnapshotUpdateUseCase } from './ReceiveTradeSnapshotUpdateUseCase'

describe('ReceiveTradeSnapshotUpdateUseCase', () => {
  let useCase: ReceiveTradeSnapshotUpdateUseCase
  let mockTradeSnapshotDataAgent: jest.Mocked<TradeSnapshotDataAgent>
  let mockRDDataAgent: jest.Mocked<ReceivablesDiscountingDataAgent>
  let mockNotificationClient: jest.Mocked<NotificationClient>
  let mockTradeSnapshotValidator: jest.Mocked<TradeSnapshotValidator>

  beforeEach(() => {
    mockTradeSnapshotDataAgent = createMockInstance(TradeSnapshotDataAgent)
    mockRDDataAgent = createMockInstance(ReceivablesDiscountingDataAgent)
    mockNotificationClient = createMockInstance(NotificationClient)
    mockTradeSnapshotValidator = createMockInstance(TradeSnapshotValidator)

    useCase = new ReceiveTradeSnapshotUpdateUseCase(
      mockTradeSnapshotDataAgent,
      mockRDDataAgent,
      mockNotificationClient,
      mockTradeSnapshotValidator
    )
  })

  describe('success', () => {
    it('should update the trade snapshot successfully', async () => {
      const currentTradeSnapshot = buildFakeTradeSnapshot()
      const rd = buildFakeReceivablesDiscountingExtended()
      const acceptedReply = buildFakeReply({ type: ReplyType.Accepted, rdId: rd.staticId })

      mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValueOnce(currentTradeSnapshot)
      mockTradeSnapshotValidator.validateAcceptedRD.mockResolvedValueOnce(acceptedReply)
      mockRDDataAgent.findByStaticId.mockResolvedValueOnce(rd)

      const mockMessage = createMessage(currentTradeSnapshot)
      const updatedTradeSnapshot = mockMessage.data.entry

      await useCase.execute(mockMessage)

      expect(mockTradeSnapshotDataAgent.findByTradeSourceId).toBeCalledWith(updatedTradeSnapshot.sourceId)
      expect(mockTradeSnapshotValidator.validateAcceptedRD).toHaveBeenCalledWith(updatedTradeSnapshot.sourceId)
      expect(mockTradeSnapshotDataAgent.updateCreate).toHaveBeenCalledWith(updatedTradeSnapshot)
      expect(mockRDDataAgent.findByStaticId).toHaveBeenCalledWith(acceptedReply.rdId)
      expect(mockNotificationClient.createUpdateNotification).toHaveBeenCalledWith(
        rd,
        mockMessage.data.senderStaticId,
        mockMessage.data.updateType,
        tradeFinanceManager.canReadRDRequests.action,
        mockMessage.context,
        updatedTradeSnapshot.createdAt
      )
      expect(mockNotificationClient.sendNotification).toHaveBeenCalled()
    })

    it('should not update trade snapshot is the date is older than the current one', async () => {
      const currentTradeSnapshot = buildFakeTradeSnapshot()

      mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValueOnce(currentTradeSnapshot)

      const mockMessage = createMessage(currentTradeSnapshot, 0)
      const updatedTradeSnapshot = mockMessage.data.entry

      await useCase.execute(mockMessage)

      expect(mockTradeSnapshotDataAgent.findByTradeSourceId).toBeCalledWith(updatedTradeSnapshot.sourceId)
      expect(mockTradeSnapshotDataAgent.update).not.toHaveBeenCalled()
    })
  })

  describe('failures', () => {
    it('should throw InvalidPayloadProcessingError if the trade snapshot does not exist in the DB', async () => {
      const mockMessage = createMessage(buildFakeTradeSnapshot())
      await expect(useCase.execute(mockMessage)).rejects.toThrowError(InvalidPayloadProcessingError)
    })
  })

  function createMessage(currentTradeSnapshot: ITradeSnapshot, hours = 2) {
    const updateTradeSnapshot = {
      ...currentTradeSnapshot,
      createdAt: datePlusHours(currentTradeSnapshot.createdAt, hours),
      trade: { field: 'changedField' }
    }
    return buildFakeReceivableFinanceMessage(updateTradeSnapshot, UpdateType.TradeSnapshot)
  }
})
