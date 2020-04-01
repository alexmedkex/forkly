import { ErrorCode } from '@komgo/error-utilities'
import {
  buildFakeReceivablesDiscountingExtended,
  buildFakeTradeSnapshot,
  RDStatus,
  buildFakeQuote,
  ReplyType,
  ParticipantRFPStatus
} from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { QuoteDataAgent, RFPDataAgent, ReplyDataAgent, TradeSnapshotDataAgent } from '../../data-layer/data-agents'
import { buildFakeReply } from '../../data-layer/data-agents/utils/faker'
import { DataLayerError } from '../../data-layer/errors'
import { IReply } from '../../data-layer/models/replies/IReply'
import { EntityNotFoundError } from '../errors'

import { RDInfoAggregator } from './RDInfoAggregator'

const mockQuote = buildFakeQuote()
const COMPANY_STATIC_ID = 'company-static-id'

describe('RDInfoAggregator', () => {
  let aggregator: RDInfoAggregator
  let mockTradeSnapshotDataAgent: jest.Mocked<TradeSnapshotDataAgent>
  let mockRFPDataAgent: jest.Mocked<RFPDataAgent>
  let mockQuoteDataAgent: jest.Mocked<QuoteDataAgent>
  let mockReplyDataAgent: jest.Mocked<ReplyDataAgent>

  beforeEach(() => {
    mockTradeSnapshotDataAgent = createMockInstance(TradeSnapshotDataAgent)
    mockRFPDataAgent = createMockInstance(RFPDataAgent)
    mockQuoteDataAgent = createMockInstance(QuoteDataAgent)
    mockReplyDataAgent = createMockInstance(ReplyDataAgent)

    mockQuoteDataAgent.findByStaticId.mockResolvedValue(mockQuote)

    aggregator = new RDInfoAggregator(
      mockTradeSnapshotDataAgent,
      mockRFPDataAgent,
      mockQuoteDataAgent,
      mockReplyDataAgent,
      COMPANY_STATIC_ID
    )
  })

  describe('aggregate', () => {
    const rdData = buildFakeReceivablesDiscountingExtended()

    it('should aggregate data successfully to the RD with RFP', async () => {
      const snapshot = buildFakeTradeSnapshot()
      const createdAt = new Date()
      const rfpReq = { rfpId: '123', rdId: rdData.staticId, participantStaticIds: ['11', '22'], createdAt }

      mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValue(snapshot)
      mockRFPDataAgent.findByRdId.mockResolvedValue(rfpReq)
      mockReplyDataAgent.findAllByRdId.mockResolvedValue([])

      const result = await aggregator.aggregate(rdData)

      expect(result.status).toEqual(RDStatus.Requested)
      expect(result.rd).toEqual(rdData)
      expect(result.tradeSnapshot).toEqual(snapshot)
      expect(result.rfp).toMatchObject({ participantStaticIds: ['11', '22'], createdAt })
    })

    it('should aggregate data successfully without RFP', async () => {
      const snapshot = buildFakeTradeSnapshot()
      mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValue(snapshot)
      mockRFPDataAgent.findByRdId.mockResolvedValue(null)

      const result = await aggregator.aggregate(rdData)

      expect(result.status).toEqual(RDStatus.PendingRequest)
      expect(result.rfp).toBeFalsy()
      expect(result.rd).toEqual(rdData)
      expect(result.tradeSnapshot).toEqual(snapshot)
    })

    it('should aggregate data successfully to the RD with RFP and no replies', async () => {
      const snapshot = buildFakeTradeSnapshot()
      const rfpReq = { rfpId: '123', rdId: rdData.staticId, participantStaticIds: ['11', '22'] }

      mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValue(snapshot)
      mockRFPDataAgent.findByRdId.mockResolvedValue(rfpReq)
      mockReplyDataAgent.findAllByRdId.mockResolvedValue([])

      const result = await aggregator.aggregate(rdData)

      expect(result.status).toEqual(RDStatus.Requested)
      expect(result.rd).toEqual(rdData)
      expect(result.tradeSnapshot).toEqual(snapshot)
      expect(result.rfp).toMatchObject({ participantStaticIds: ['11', '22'] })
    })

    it('should aggregate data successfully without RFP and snapshot', async () => {
      mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValue(null)
      mockRFPDataAgent.findByRdId.mockResolvedValue(null)

      const result = await aggregator.aggregate(rdData)

      expect(result.status).toEqual(RDStatus.PendingRequest)
      expect(result.rfp).toBeFalsy()
      expect(result.rd).toEqual(rdData)
      expect(result.tradeSnapshot).toBeFalsy()
    })

    it('should fail and throw an EntityNotFoundError if rd is null', async () => {
      await expect(aggregator.aggregate(null)).rejects.toThrowError(EntityNotFoundError)
    })

    it('should fail and throw same error as data layer', async () => {
      mockTradeSnapshotDataAgent.findByTradeSourceId.mockRejectedValue(
        new DataLayerError('error', ErrorCode.DatabaseInvalidData)
      )

      await expect(aggregator.aggregate(rdData)).rejects.toThrowError(DataLayerError)
    })

    describe('RD statuses', () => {
      it('should aggregate data successfully with status "request declined"', async () => {
        const snapshot = buildFakeTradeSnapshot()
        const rfpReq = { rfpId: '123', rdId: rdData.staticId, participantStaticIds: ['11', '22'] }
        const reply0 = buildFakeReply({ participantId: '11', type: ReplyType.Reject })
        const reply1 = buildFakeReply({ participantId: '22', type: ReplyType.Reject })

        mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValue(snapshot)
        mockRFPDataAgent.findByRdId.mockResolvedValue(rfpReq)
        mockReplyDataAgent.findAllByRdId.mockResolvedValue([reply0, reply1])

        const result = await aggregator.aggregate(rdData)

        expect(result.status).toEqual(RDStatus.RequestDeclined)
      })

      it('should aggregate data successfully with status "quote submitted"', async () => {
        const snapshot = buildFakeTradeSnapshot()
        const rfpReq = { rfpId: '123', rdId: rdData.staticId, participantStaticIds: ['11', '22'] }
        const reply = buildFakeReply({ participantId: '11', type: ReplyType.Submitted })

        mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValue(snapshot)
        mockRFPDataAgent.findByRdId.mockResolvedValue(rfpReq)
        mockReplyDataAgent.findAllByRdId.mockResolvedValue([reply])

        const result = await aggregator.aggregate(rdData)

        expect(result.status).toEqual(RDStatus.QuoteSubmitted)
      })

      it('should aggregate data successfully with status "expired" if a quote was not submitted and reply is declined', async () => {
        const snapshot = buildFakeTradeSnapshot()
        const rfpReq = { rfpId: '123', rdId: rdData.staticId, participantStaticIds: ['11', '22'] }
        const reply0 = buildFakeReply({ participantId: '11', type: ReplyType.Declined })
        const reply1 = buildFakeReply({ participantId: '22', type: ReplyType.Declined })

        mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValue(snapshot)
        mockRFPDataAgent.findByRdId.mockResolvedValue(rfpReq)
        mockReplyDataAgent.findAllByRdId.mockResolvedValue([reply0, reply1])

        const result = await aggregator.aggregate(rdData)

        expect(result.status).toEqual(RDStatus.RequestExpired)
      })

      it('should aggregate data successfully with status "quote declined" if a quote was submitted and reply is declined', async () => {
        const snapshot = buildFakeTradeSnapshot()
        const quoteId = '1'
        const quote = {} as any
        mockQuoteDataAgent.findByStaticId.mockImplementation(id => (id === quoteId ? quote : undefined))
        const rfpReq = { rfpId: '123', rdId: rdData.staticId, participantStaticIds: ['11'] }
        const reply0 = buildFakeReply({
          participantId: '11',
          senderStaticId: COMPANY_STATIC_ID,
          type: ReplyType.Submitted,
          quoteId
        })
        const reply1 = buildFakeReply({ participantId: '11', type: ReplyType.Declined })

        mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValue(snapshot)
        mockRFPDataAgent.findByRdId.mockResolvedValue(rfpReq)
        mockReplyDataAgent.findAllByRdId.mockResolvedValue([reply0, reply1])

        const result = await aggregator.aggregate(rdData)

        expect(result.status).toEqual(RDStatus.QuoteDeclined)
      })

      it('should aggregate data successfully with status "quote accepted"', async () => {
        const snapshot = buildFakeTradeSnapshot()
        const rfpReq = { rfpId: '123', rdId: rdData.staticId, participantStaticIds: ['11', '22'] }
        const reply = buildFakeReply({ participantId: '11', type: ReplyType.Accepted })

        mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValue(snapshot)
        mockRFPDataAgent.findByRdId.mockResolvedValue(rfpReq)
        mockReplyDataAgent.findAllByRdId.mockResolvedValue([reply])

        const result = await aggregator.aggregate(rdData)

        expect(result.status).toEqual(RDStatus.QuoteAccepted)
        expect(result.acceptedParticipantStaticId).toEqual('11')
      })
    })

    describe('Bank', () => {
      it('should aggregate status to declined if auto declined', async () => {
        const snapshot = buildFakeTradeSnapshot()
        const quoteId = '1'
        const quote = {} as any
        mockQuoteDataAgent.findByStaticId.mockImplementation(id => (id === quoteId ? quote : undefined))
        const rfpReq = { rfpId: '123', rdId: rdData.staticId, participantStaticIds: [] }
        const reply0 = buildFakeReply({
          participantId: COMPANY_STATIC_ID,
          senderStaticId: COMPANY_STATIC_ID,
          type: ReplyType.Submitted,
          quoteId
        })
        const reply1 = buildFakeReply({ participantId: COMPANY_STATIC_ID, type: ReplyType.Declined })

        mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValue(snapshot)
        mockRFPDataAgent.findByRdId.mockResolvedValue(rfpReq)
        mockReplyDataAgent.findAllByRdId.mockResolvedValue([reply1, reply0])

        const result = await aggregator.aggregate(rdData)

        expect(result.status).toEqual(RDStatus.QuoteDeclined)
      })
    })
  })

  describe('createParticipantRFPSummaries', () => {
    const participantStaticIds = ['staticId0', 'staticId1', 'staticId2', 'staticId3', 'staticId4']

    it('should create summary with status Requested if there are no replies for participant', async () => {
      const replies = []

      const result = await aggregator.createParticipantRFPSummaries(participantStaticIds, replies)

      expect(result.length).toEqual(5)
      expect(result[0]).toMatchObject({
        participantStaticId: participantStaticIds[0],
        status: ParticipantRFPStatus.Requested
      })
    })

    it('should create summary with status Rejected if there is a Reject from the participant', async () => {
      const reply1 = buildFakeReply(
        { participantId: participantStaticIds[1], type: ReplyType.Reject, quoteId: 'mock-quote-id' },
        true
      )
      const replies = [reply1]

      const result = await aggregator.createParticipantRFPSummaries(participantStaticIds, replies)

      expect(result[1]).toMatchObject({
        participantStaticId: participantStaticIds[1],
        status: ParticipantRFPStatus.Rejected
      })
      expect(result[1].replies[0].quote).toMatchObject(mockQuote)
    })

    it('should create a summary with status Quote Submitted if a quote is submitted', async () => {
      const reply1 = buildFakeReply({ participantId: participantStaticIds[1], type: ReplyType.Submitted }, true)
      const replies = [reply1]

      const result = await aggregator.createParticipantRFPSummaries(participantStaticIds, replies)

      expect(result[1]).toMatchObject({
        participantStaticId: participantStaticIds[1],
        status: ParticipantRFPStatus.QuoteSubmitted
      })
    })

    it('should create a summary with status Quote Declined if a quote is declined', async () => {
      const reply1 = buildFakeReply({ participantId: participantStaticIds[1], type: ReplyType.Declined }, true)
      const replies = [reply1]

      const result = await aggregator.createParticipantRFPSummaries(participantStaticIds, replies)

      expect(result[1]).toMatchObject({
        participantStaticId: participantStaticIds[1],
        status: ParticipantRFPStatus.QuoteDeclined
      })
    })

    it('should create a summary with status Quote Accepted if a quote is accepted', async () => {
      const reply1 = buildFakeReply({ participantId: participantStaticIds[1], type: ReplyType.Accepted }, true)
      const replies = [reply1]

      const result = await aggregator.createParticipantRFPSummaries(participantStaticIds, replies)

      expect(result[1]).toMatchObject({
        participantStaticId: participantStaticIds[1],
        status: ParticipantRFPStatus.QuoteAccepted
      })
    })

    describe('Quote is accepted from another participant (auto decline others)', () => {
      let reply2: IReply
      beforeEach(() => {
        reply2 = buildFakeReply({ participantId: participantStaticIds[2], type: ReplyType.Accepted })
      })

      it('should create summary with status Request Expired if there are no replies for participant', async () => {
        const reply1 = buildFakeReply({ participantId: participantStaticIds[1], type: ReplyType.Accepted }, true)
        const replies = [reply1, reply2]

        const result = await aggregator.createParticipantRFPSummaries(participantStaticIds, replies)

        expect(result.length).toEqual(5)
        expect(result[0]).toMatchObject({
          participantStaticId: participantStaticIds[0],
          status: ParticipantRFPStatus.RequestExpired
        })
      })

      it('should create summary with status Rejected if RD was already rejected', async () => {
        const reply1 = buildFakeReply({ participantId: participantStaticIds[1], type: ReplyType.Reject }, true)
        const replies = [reply1, reply2]

        const result = await aggregator.createParticipantRFPSummaries(participantStaticIds, replies)

        expect(result.length).toEqual(5)
        expect(result[1]).toMatchObject({
          participantStaticId: participantStaticIds[1],
          status: ParticipantRFPStatus.Rejected
        })
      })

      it('should create summary with status Quote Declined if a quote was submitted, but not accepted', async () => {
        const reply1 = buildFakeReply({ participantId: participantStaticIds[1], type: ReplyType.Submitted }, true)
        const replies = [reply1, reply2]

        const result = await aggregator.createParticipantRFPSummaries(participantStaticIds, replies)

        expect(result.length).toEqual(5)
        expect(result[1]).toMatchObject({
          participantStaticId: participantStaticIds[1],
          status: ParticipantRFPStatus.QuoteDeclined
        })
      })

      it('should create summary with status Quote Declined if a quote was declined, but not accepted', async () => {
        const reply0 = buildFakeReply({ participantId: participantStaticIds[1], type: ReplyType.Submitted }, true)
        const reply1 = buildFakeReply({ participantId: participantStaticIds[1], type: ReplyType.Declined }, true)
        const replies = [reply0, reply1, reply2]

        const result = await aggregator.createParticipantRFPSummaries(participantStaticIds, replies)

        expect(result.length).toEqual(5)
        expect(result[1]).toMatchObject({
          participantStaticId: participantStaticIds[1],
          status: ParticipantRFPStatus.QuoteDeclined
        })
      })
    })
  })
})
