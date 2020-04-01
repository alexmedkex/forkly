import { ReplyType, buildFakeReceivablesDiscountingExtended, IReceivablesDiscounting } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ReplyDataAgent } from '../../data-layer/data-agents'
import { buildFakeReply } from '../../data-layer/data-agents/utils/faker'
import { IReply } from '../../data-layer/models/replies/IReply'
import { timestamp, ITimestamp } from '../../utils/timestamp'
import { ValidationDuplicateError } from '../errors'
import { OutboundMessageFactory, OutboundPublisher } from '../messaging'
import { AddDiscountingRequestType } from '../messaging/types/AddDiscountingRequestType'
import { ReplyFactory } from '../rfp/ReplyFactory'
import { AcceptedRDValidator, AddDiscountingValidator } from '../validation'

import { AddDiscountingUseCase } from './AddDiscountingUseCase'

describe('AddDiscountingUseCase', () => {
  let usecase: AddDiscountingUseCase
  let mockAcceptedRDValidator: jest.Mocked<AcceptedRDValidator>
  let mockAddDiscountingValidator: jest.Mocked<AddDiscountingValidator>
  let mockReplyFactory: jest.Mocked<ReplyFactory>
  let mockReplyDataAgent: jest.Mocked<ReplyDataAgent>
  let mockOutboundMessageFactory: jest.Mocked<OutboundMessageFactory>
  let mockOutboundPublisher: jest.Mocked<OutboundPublisher>

  beforeEach(() => {
    mockAcceptedRDValidator = createMockInstance(AcceptedRDValidator)
    mockAddDiscountingValidator = createMockInstance(AddDiscountingValidator)
    mockReplyDataAgent = createMockInstance(ReplyDataAgent)
    mockReplyFactory = createMockInstance(ReplyFactory)
    mockOutboundMessageFactory = createMockInstance(OutboundMessageFactory)
    mockOutboundPublisher = createMockInstance(OutboundPublisher)

    usecase = new AddDiscountingUseCase(
      mockAcceptedRDValidator,
      mockAddDiscountingValidator,
      mockReplyDataAgent,
      mockReplyFactory,
      mockOutboundMessageFactory,
      mockOutboundPublisher
    )
  })
  const PARTICIPANT_ID = 'participantStaticId'
  let rd: IReceivablesDiscounting
  let acceptedReply: IReply

  beforeEach(() => {
    rd = buildFakeReceivablesDiscountingExtended()
    acceptedReply = buildFakeReply({
      rdId: rd.staticId,
      participantId: PARTICIPANT_ID,
      type: ReplyType.AcceptDiscountingRequest
    })
  })

  describe('Success', () => {
    const mockMessage = { messageField: 'myMessageField' } as any

    it('should send out Add Discounting Request', async () => {
      mockAcceptedRDValidator.validateRDAccepted.mockResolvedValueOnce({ rd, acceptedReply })

      const mockAddDiscountingReply = timestamp(
        buildFakeReply({ type: ReplyType.AddDiscountingRequest, rdId: rd.staticId })
      )
      mockReplyFactory.createRDReply.mockReturnValueOnce(mockAddDiscountingReply)
      mockOutboundMessageFactory.createAddDiscountingMessage.mockReturnValueOnce(mockMessage)

      await usecase.execute(rd.staticId)

      expect(mockAddDiscountingValidator.validate).toBeCalledWith(rd)

      expect(mockReplyDataAgent.create).toBeCalledWith(
        expectedReply(ReplyType.AddDiscountingRequest, mockAddDiscountingReply)
      )
      expect(mockOutboundMessageFactory.createAddDiscountingMessage).toBeCalledWith(
        rd.staticId,
        rd,
        AddDiscountingRequestType.Add,
        mockAddDiscountingReply
      )
      expect(mockOutboundPublisher.send).toBeCalledWith(PARTICIPANT_ID, mockMessage)
    })
  })

  describe('Failure', () => {
    it('should fail if add discounting request exists', async () => {
      mockAcceptedRDValidator.validateRDAccepted.mockResolvedValueOnce({ rd, acceptedReply })

      const existingRequest = buildFakeReply({
        rdId: rd.staticId,
        participantId: PARTICIPANT_ID,
        type: ReplyType.AddDiscountingRequest
      })
      mockReplyDataAgent.findByRdIdAndType.mockResolvedValueOnce(existingRequest)

      await expect(usecase.execute(rd.staticId)).rejects.toThrowError(ValidationDuplicateError)
    })
  })
})

function expectedReply(replyType: ReplyType, addDiscountingReply: IReply & ITimestamp): any {
  return {
    staticId: addDiscountingReply.staticId,
    rdId: addDiscountingReply.rdId,
    type: replyType,
    participantId: addDiscountingReply.participantId,
    createdAt: addDiscountingReply.createdAt,
    updatedAt: addDiscountingReply.updatedAt,
    senderStaticId: addDiscountingReply.senderStaticId
  }
}
