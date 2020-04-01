import { buildFakeReceivablesDiscountingExtended, buildFakeQuote, ReplyType } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { PRODUCT_ID, SubProductId } from '../../../constants'
import { ReplyDataAgent } from '../../../data-layer/data-agents'
import { RFPClient, TaskClient } from '../../microservice-clients'
import { TaskType } from '../../types'
import { RFPValidator } from '../../validation'
import { ReplyFactory } from '../ReplyFactory'

import { SubmitQuoteUseCase } from './SubmitQuoteUseCase'

const COMPANY_STATIC_ID = 'company-static-id'
const mockRD = buildFakeReceivablesDiscountingExtended()
const mockQuote = buildFakeQuote()
const mockRFP = {
  rfpId: 'rfpId',
  rdId: 'rdId',
  participantStaticIds: [],
  senderStaticId: 'senderStaticId'
}
const mockRFPResponse = {
  rfpId: 'rfpId',
  actionStatus: {}
}

describe('SubmitQuoteUseCase', () => {
  let useCase: SubmitQuoteUseCase
  let mockRFPValidator: jest.Mocked<RFPValidator>
  let mockReplyDataAgent: jest.Mocked<ReplyDataAgent>
  let mockRFPClient: jest.Mocked<RFPClient>
  let mockTaskClient: jest.Mocked<TaskClient>

  beforeEach(() => {
    mockRFPValidator = createMockInstance(RFPValidator)
    mockReplyDataAgent = createMockInstance(ReplyDataAgent)
    mockRFPClient = createMockInstance(RFPClient)
    mockTaskClient = createMockInstance(TaskClient)

    mockRFPValidator.validateQuoteSubmission.mockResolvedValue({
      rd: mockRD,
      rfp: mockRFP,
      quote: mockQuote
    })
    mockRFPClient.postRFPResponse.mockResolvedValue(mockRFPResponse)
    mockReplyDataAgent.create.mockResolvedValueOnce({} as any)

    useCase = new SubmitQuoteUseCase(
      mockRFPValidator,
      COMPANY_STATIC_ID,
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
      const quoteSubmission = { rdId: mockRD.staticId, quoteId: mockQuote.staticId }
      const result = await useCase.execute(quoteSubmission, 'userId')

      expect(result).toEqual(mockRFPResponse)
      expect(mockRFPValidator.validateQuoteSubmission).toHaveBeenCalledWith(quoteSubmission)
      expect(mockTaskClient.completeTask).toHaveBeenCalledWith(TaskType.RequestTaskType, 'userId', {
        productId: PRODUCT_ID,
        subProductId: SubProductId.ReceivableDiscounting,
        rdId: quoteSubmission.rdId,
        senderStaticId: mockRFP.senderStaticId
      })
      expect(mockRFPClient.postRFPResponse).toHaveBeenCalledWith(mockRFP.rfpId, expect.anything(), ReplyType.Submitted)
      expect(mockReplyDataAgent.create).toHaveBeenCalledWith({
        staticId: expect.any(String),
        rdId: mockRD.staticId,
        type: ReplyType.Submitted,
        senderStaticId: COMPANY_STATIC_ID,
        participantId: COMPANY_STATIC_ID,
        comment: undefined,
        quoteId: mockQuote.staticId,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })
  })
})
