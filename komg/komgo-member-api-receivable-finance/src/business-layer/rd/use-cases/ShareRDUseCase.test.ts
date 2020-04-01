import { ReplyType, buildFakeReceivablesDiscountingExtended } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { buildFakeReply } from '../../../data-layer/data-agents/utils/faker'
import { OutboundMessageFactory, OutboundPublisher } from '../../messaging'
import { UpdateType } from '../../types'
import { AcceptedRDValidator } from '../../validation'

import { ShareRDUseCase } from './ShareRDUseCase'

describe('ShareRDUseCase', () => {
  let usecase: ShareRDUseCase
  let mockAcceptedRDValidator: jest.Mocked<AcceptedRDValidator>
  let mockOutboundMessageFactory: jest.Mocked<OutboundMessageFactory>
  let mockOutboundPublisher: jest.Mocked<OutboundPublisher>

  beforeEach(() => {
    mockAcceptedRDValidator = createMockInstance(AcceptedRDValidator)
    mockOutboundMessageFactory = createMockInstance(OutboundMessageFactory)
    mockOutboundPublisher = createMockInstance(OutboundPublisher)

    usecase = new ShareRDUseCase(mockAcceptedRDValidator, mockOutboundMessageFactory, mockOutboundPublisher)
  })

  describe('Success', () => {
    const mockMessage = { messageField: 'myMessageField' } as any

    it('should send out an RD update', async () => {
      const rdId = 'rdId'
      const participantId = 'participantStaticId'
      const rd = buildFakeReceivablesDiscountingExtended()
      const acceptedReply = buildFakeReply({ rdId, participantId, type: ReplyType.AddDiscountingRequest })
      mockAcceptedRDValidator.validateRDAccepted.mockResolvedValueOnce({ rd, acceptedReply })

      mockOutboundMessageFactory.createRDUpdateMessage.mockReturnValueOnce(mockMessage)

      await usecase.execute(rdId)

      expect(mockOutboundMessageFactory.createRDUpdateMessage).toBeCalledWith(
        rdId,
        rd,
        UpdateType.ReceivablesDiscounting
      )
      expect(mockOutboundPublisher.send).toBeCalledWith(participantId, mockMessage)
    })
  })
})
