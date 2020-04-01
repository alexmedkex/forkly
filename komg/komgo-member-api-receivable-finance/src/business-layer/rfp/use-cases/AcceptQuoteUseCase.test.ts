import { buildFakeReceivablesDiscountingExtended, buildFakeQuote, ReplyType, IRFPAcceptResponse } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { SubProductId, PRODUCT_ID } from '../../../constants'
import { ReplyDataAgent } from '../../../data-layer/data-agents'
import { QuoteAccept } from '../../../service-layer/requests'
import { RFPClient, TaskClient } from '../../microservice-clients'
import { TaskType } from '../../types'
import { RFPValidator } from '../../validation'
import { ReplyFactory } from '../ReplyFactory'

import { AcceptQuoteUseCase } from './AcceptQuoteUseCase'

const COMPANY_STATIC_ID = 'company-static-id'
const mockRD = buildFakeReceivablesDiscountingExtended()
const mockQuote = buildFakeQuote()
const mockRFP = {
  rfpId: 'rfpId',
  rdId: 'rdId',
  participantStaticIds: [],
  senderStaticId: 'senderStaticId'
}
const mockRFPResponse: IRFPAcceptResponse = {
  rfpId: 'rfpId',
  actionStatuses: []
}

describe('AcceptQuoteUseCase', () => {
  let useCase: AcceptQuoteUseCase
  let mockRFPValidator: jest.Mocked<RFPValidator>
  let mockReplyDataAgent: jest.Mocked<ReplyDataAgent>
  let mockRFPClient: jest.Mocked<RFPClient>
  let mockTaskClient: jest.Mocked<TaskClient>

  beforeEach(() => {
    mockRFPValidator = createMockInstance(RFPValidator)
    mockReplyDataAgent = createMockInstance(ReplyDataAgent)
    mockRFPClient = createMockInstance(RFPClient)
    mockTaskClient = createMockInstance(TaskClient)

    mockRFPValidator.validateOutboundQuoteAccept.mockResolvedValue({
      rd: mockRD,
      rfp: mockRFP,
      quote: mockQuote
    })
    mockReplyDataAgent.findAllByRdId.mockResolvedValueOnce([
      { type: ReplyType.Submitted, senderStaticId: 'senderStaticId0' },
      { type: ReplyType.Submitted, senderStaticId: 'senderStaticId1' },
      { type: ReplyType.Reject, senderStaticId: 'senderStaticId2' }
    ] as any)
    mockRFPClient.postRFPAccept.mockResolvedValue(mockRFPResponse)
    mockReplyDataAgent.create.mockResolvedValueOnce({} as any)

    useCase = new AcceptQuoteUseCase(
      mockRFPValidator,
      mockReplyDataAgent,
      mockRFPClient,
      mockTaskClient,
      new ReplyFactory(COMPANY_STATIC_ID)
    )
  })

  // This is the only necessary test as all classes are extensively tested on their own and all error cases are handled
  // by the underlying classes. Check coverage for details
  describe('execute', () => {
    it('should execute use case successfully', async () => {
      const participantStaticId = 'pId'
      const mockComment = 'myComment'

      const mockQuoteAccept: QuoteAccept = {
        rdId: mockRD.staticId,
        quoteId: mockQuote.staticId,
        participantStaticId,
        comment: mockComment
      }
      const expectedReply = {
        staticId: expect.any(String),
        rdId: mockRD.staticId,
        type: ReplyType.Accepted,
        senderStaticId: COMPANY_STATIC_ID,
        participantId: participantStaticId,
        comment: mockComment,
        quoteId: mockQuote.staticId,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }

      const expectedCreateRFPResponse = {
        responseData: {
          quote: mockQuote,
          rfpReply: expectedReply
        },
        participantStaticId
      }

      const result = await useCase.execute(mockQuoteAccept, 'userId')

      expect(result).toEqual(mockRFPResponse)
      expect(mockRFPValidator.validateOutboundQuoteAccept).toHaveBeenCalledWith(mockQuoteAccept)
      expect(mockReplyDataAgent.findAllByRdId).toHaveBeenCalledWith(mockQuoteAccept.rdId)
      expect(mockTaskClient.completeTask).toHaveBeenCalledTimes(2)
      expect(mockTaskClient.completeTask).toHaveBeenNthCalledWith(1, TaskType.ResponseTaskType, 'userId', {
        productId: PRODUCT_ID,
        subProductId: SubProductId.ReceivableDiscounting,
        rdId: mockQuoteAccept.rdId,
        senderStaticId: 'senderStaticId0'
      })
      expect(mockTaskClient.completeTask).toHaveBeenNthCalledWith(2, TaskType.ResponseTaskType, 'userId', {
        productId: PRODUCT_ID,
        subProductId: SubProductId.ReceivableDiscounting,
        rdId: mockQuoteAccept.rdId,
        senderStaticId: 'senderStaticId1'
      })
      expect(mockRFPClient.postRFPAccept).toHaveBeenCalledWith(mockRFP.rfpId, expectedCreateRFPResponse)
      expect(mockReplyDataAgent.create).toHaveBeenCalledWith(expectedReply)
    })
  })
})
