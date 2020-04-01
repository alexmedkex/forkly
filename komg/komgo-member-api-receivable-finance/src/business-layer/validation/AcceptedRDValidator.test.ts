import { IReceivablesDiscounting, buildFakeReceivablesDiscountingExtended, ReplyType } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ReceivablesDiscountingDataAgent, ReplyDataAgent } from '../../data-layer/data-agents'
import { buildFakeReply } from '../../data-layer/data-agents/utils/faker'
import { IReply } from '../../data-layer/models/replies/IReply'
import { ValidationFieldError, EntityNotFoundError } from '../errors'

import { AcceptedRDValidator } from './AcceptedRDValidator'

const MOCK_RD_ID = '123'
describe('ReceivablesDiscountingValidator', () => {
  let acceptedRDValidator: AcceptedRDValidator
  let mockRdDataAgent: jest.Mocked<ReceivablesDiscountingDataAgent>
  let mockReplyDataAgent: jest.Mocked<ReplyDataAgent>

  let rd: IReceivablesDiscounting
  let acceptedReply: IReply

  beforeEach(() => {
    mockRdDataAgent = createMockInstance(ReceivablesDiscountingDataAgent)
    mockReplyDataAgent = createMockInstance(ReplyDataAgent)
    rd = buildFakeReceivablesDiscountingExtended()
    acceptedReply = buildFakeReply({ type: ReplyType.Accepted })

    acceptedRDValidator = new AcceptedRDValidator(mockRdDataAgent, mockReplyDataAgent)
  })

  describe('validate', () => {
    it('passes validation ', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce(rd)
      mockReplyDataAgent.findByRdIdAndType.mockResolvedValueOnce(acceptedReply)
      await acceptedRDValidator.validateRDAccepted(MOCK_RD_ID)

      expect(mockRdDataAgent.findByStaticId).toBeCalledWith(MOCK_RD_ID)
      expect(mockReplyDataAgent.findByRdIdAndType).toBeCalledWith(MOCK_RD_ID, ReplyType.Accepted)
    })

    it('will throw EntityNotFoundError if RD does not exist', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce(null)

      await expect(acceptedRDValidator.validateRDAccepted(MOCK_RD_ID)).rejects.toThrowError(EntityNotFoundError)
    })

    it('should fail with ValidationFieldError if RFP reply does not exist', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce(rd)
      mockReplyDataAgent.findByRdIdAndType.mockReturnValueOnce(null)

      await expect(acceptedRDValidator.validateRDAccepted(MOCK_RD_ID)).rejects.toThrowError(ValidationFieldError)
      expect(mockReplyDataAgent.findByRdIdAndType).toBeCalledWith(MOCK_RD_ID, ReplyType.Accepted)
    })
  })
})
