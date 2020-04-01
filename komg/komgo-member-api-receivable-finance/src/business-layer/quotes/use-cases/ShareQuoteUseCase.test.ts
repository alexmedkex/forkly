import { ReplyType, buildFakeQuote } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ReplyDataAgent } from '../../../data-layer/data-agents'
import { buildFakeReply } from '../../../data-layer/data-agents/utils/faker'
import { ValidationFieldError } from '../../errors'
import { OutboundMessageFactory, OutboundPublisher } from '../../messaging'
import { UpdateType } from '../../types'

import { GetQuoteUseCase } from './GetQuoteUseCase'
import { ShareQuoteUseCase } from './ShareQuoteUseCase'

describe('ShareQuoteUseCase', () => {
  let usecase: ShareQuoteUseCase
  let mockGetQuoteUseCase: jest.Mocked<GetQuoteUseCase>
  let mockReplyDataAgent: jest.Mocked<ReplyDataAgent>
  let mockOutboundMessageFactory: jest.Mocked<OutboundMessageFactory>
  let mockOutboundPublisher: jest.Mocked<OutboundPublisher>

  beforeEach(() => {
    mockGetQuoteUseCase = createMockInstance(GetQuoteUseCase)
    mockReplyDataAgent = createMockInstance(ReplyDataAgent)
    mockOutboundMessageFactory = createMockInstance(OutboundMessageFactory)
    mockOutboundPublisher = createMockInstance(OutboundPublisher)

    usecase = new ShareQuoteUseCase(
      mockGetQuoteUseCase,
      mockReplyDataAgent,
      mockOutboundMessageFactory,
      mockOutboundPublisher
    )
  })

  describe('Success', () => {
    const mockQuoteId = 'quoteId'
    const mockMessage = { messageField: 'myMessageField' } as any

    it('should send a quote successfully', async () => {
      const rdId = 'rdId'
      const senderStaticId = 'senderStaticId'
      const quote = buildFakeQuote()
      const mockReply = buildFakeReply({ rdId, senderStaticId })
      mockGetQuoteUseCase.execute.mockResolvedValueOnce(quote)
      mockReplyDataAgent.findByQuoteIdAndType.mockResolvedValueOnce(mockReply)

      mockOutboundMessageFactory.createRDUpdateMessage.mockReturnValueOnce(mockMessage)

      await usecase.execute(mockQuoteId)

      expect(mockGetQuoteUseCase.execute).toHaveBeenCalledWith(mockQuoteId)
      expect(mockReplyDataAgent.findByQuoteIdAndType).toHaveBeenCalledWith(mockQuoteId, ReplyType.Accepted)
      expect(mockOutboundMessageFactory.createRDUpdateMessage).toBeCalledWith(
        rdId,
        quote,
        UpdateType.FinalAgreedTermsData
      )
      expect(mockOutboundPublisher.send).toBeCalledWith(senderStaticId, mockMessage)
    })
  })

  describe('Failures', () => {
    it('should fail with ValidationFieldError if RFP Reply is not found', async () => {
      const quote = buildFakeQuote()
      mockGetQuoteUseCase.execute.mockResolvedValueOnce(quote)

      await expect(usecase.execute(quote.staticId)).rejects.toThrowError(ValidationFieldError)
    })
  })
})
