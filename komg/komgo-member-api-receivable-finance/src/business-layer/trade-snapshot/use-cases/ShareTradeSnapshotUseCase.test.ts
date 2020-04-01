import { ReplyType, buildFakeTradeSnapshot } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { TradeSnapshotDataAgent } from '../../../data-layer/data-agents'
import { IReply } from '../../../data-layer/models/replies/IReply'
import { EntityNotFoundError } from '../../errors'
import { OutboundMessageFactory, OutboundPublisher } from '../../messaging'
import { TradeSnapshotValidator } from '../../validation'

import { ShareTradeSnapshotUseCase } from './ShareTradeSnapshotUseCase'

describe('ShareTradeSnapshotUseCase', () => {
  let useCase: ShareTradeSnapshotUseCase
  let mockTradeSnapshotDataAgent: jest.Mocked<TradeSnapshotDataAgent>
  let mockOutboundMessageFactory: jest.Mocked<OutboundMessageFactory>
  let mockOutboundPublisher: jest.Mocked<OutboundPublisher>
  let mockTradeSnapshotValidator: jest.Mocked<TradeSnapshotValidator>

  beforeEach(() => {
    mockTradeSnapshotDataAgent = createMockInstance(TradeSnapshotDataAgent)
    mockOutboundMessageFactory = createMockInstance(OutboundMessageFactory)
    mockOutboundPublisher = createMockInstance(OutboundPublisher)
    mockTradeSnapshotValidator = createMockInstance(TradeSnapshotValidator)

    useCase = new ShareTradeSnapshotUseCase(
      mockTradeSnapshotDataAgent,
      mockOutboundMessageFactory,
      mockOutboundPublisher,
      mockTradeSnapshotValidator
    )
  })

  it('should execute use case successfully', async () => {
    const sourceId = 'sourceId'
    const mockRfpReply: IReply = {
      rdId: 'rdId',
      senderStaticId: 'senderStaticId',
      participantId: 'participantId',
      staticId: 'staticId',
      type: ReplyType.Accepted
    }
    mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValueOnce(buildFakeTradeSnapshot())
    mockTradeSnapshotValidator.validateAcceptedRD.mockResolvedValueOnce(mockRfpReply)

    await useCase.execute(sourceId)

    expect(mockTradeSnapshotValidator.validateAcceptedRD).toBeCalledTimes(1)
    expect(mockTradeSnapshotDataAgent.findByTradeSourceId).toBeCalledTimes(1)
    expect(mockOutboundPublisher.send).toBeCalledTimes(1)
  })

  it('should throw if there is no trade snapshot to share', async () => {
    const sourceId = 'sourceId'

    await expect(useCase.execute(sourceId)).rejects.toThrowError(EntityNotFoundError)

    expect(mockTradeSnapshotDataAgent.findByTradeSourceId).toBeCalledTimes(1)
    expect(mockTradeSnapshotValidator.validateAcceptedRD).toBeCalledTimes(0)
    expect(mockOutboundPublisher.send).toBeCalledTimes(0)
  })
})
