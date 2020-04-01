import { buildFakeReceivablesDiscountingExtended, IParticipantRFPSummary, ParticipantRFPStatus } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import {
  QuoteDataAgent,
  ReceivablesDiscountingDataAgent,
  RFPDataAgent,
  ReplyDataAgent
} from '../../data-layer/data-agents'
import { buildFakeReply } from '../../data-layer/data-agents/utils/faker'
import { IRFPRequest } from '../../data-layer/models/rfp/IRFPRequestDocument'
import { ReceivablesDiscountingRFPRequest } from '../../service-layer/requests'
import {
  EntityNotFoundError,
  ValidationDuplicateError,
  ValidationFieldError,
  InvalidPayloadProcessingError
} from '../errors'
import { CompanyRegistryClient } from '../microservice-clients'
import { RDInfoAggregator } from '../rd/RDInfoAggregator'

import { QuoteValidator } from './QuoteValidator'
import { RFPValidator } from './RFPValidator'

const STATIC_ID_0 = 'participantStaticId0'
const STATIC_ID_1 = 'participantStaticId1'

const mockRFPRequest: ReceivablesDiscountingRFPRequest = {
  rdId: 'rdId',
  participantStaticIds: [STATIC_ID_0, STATIC_ID_1]
}

const mockRFPRequestDocument: IRFPRequest = {
  rfpId: 'rfpId',
  rdId: mockRFPRequest.rdId,
  participantStaticIds: mockRFPRequest.participantStaticIds,
  createdAt: 'date'
}

const mockParticipantRFPSummary: IParticipantRFPSummary = {
  status: ParticipantRFPStatus.QuoteSubmitted,
  participantStaticId: 'test-participant-static-id',
  replies: []
}

const rdBase = buildFakeReceivablesDiscountingExtended()

describe('RFPValidator', () => {
  let validator: RFPValidator
  let mockRdDataAgent: jest.Mocked<ReceivablesDiscountingDataAgent>
  let mockRFPDataAgent: jest.Mocked<RFPDataAgent>
  let mockReplyDataAgent: jest.Mocked<ReplyDataAgent>
  let mockQuoteDataAgent: jest.Mocked<QuoteDataAgent>
  let mockCompanyRegistryClient: jest.Mocked<CompanyRegistryClient>
  let mockRDInfoAggregator: jest.Mocked<RDInfoAggregator>
  let mockQuoteValidator: jest.Mocked<QuoteValidator>

  beforeEach(() => {
    mockRdDataAgent = createMockInstance(ReceivablesDiscountingDataAgent)
    mockRFPDataAgent = createMockInstance(RFPDataAgent)
    mockReplyDataAgent = createMockInstance(ReplyDataAgent)
    mockQuoteDataAgent = createMockInstance(QuoteDataAgent)
    mockCompanyRegistryClient = createMockInstance(CompanyRegistryClient)
    mockRDInfoAggregator = createMockInstance(RDInfoAggregator)
    mockQuoteValidator = createMockInstance(QuoteValidator)

    mockRdDataAgent.findByStaticId.mockResolvedValue(rdBase)
    mockRFPDataAgent.findByRdId.mockResolvedValue(null)
    mockCompanyRegistryClient.getAllMembersStaticIds.mockResolvedValue([STATIC_ID_0, STATIC_ID_1])

    validator = new RFPValidator(
      mockRdDataAgent,
      mockRFPDataAgent,
      mockReplyDataAgent,
      mockQuoteDataAgent,
      mockCompanyRegistryClient,
      mockRDInfoAggregator,
      mockQuoteValidator,
      'test-static-id'
    )
  })

  describe('validateRequest', () => {
    it('should not throw if all participants are members, RD exists in DB and has not been used for a RFP', async () => {
      await validator.validateRequest(mockRFPRequest)
    })

    it('should throw if RdDataAgent fails', async () => {
      mockRdDataAgent.findByStaticId.mockRejectedValueOnce(new Error())

      await expect(validator.validateRequest(mockRFPRequest)).rejects.toThrow()
    })

    it('should throw if RdDataAgent does not return data', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValue(null)

      await expect(validator.validateRequest(mockRFPRequest)).rejects.toThrow()
    })

    it('should throw if RFPDataAgent fails', async () => {
      mockRFPDataAgent.findByRdId.mockRejectedValueOnce(new Error())

      await expect(validator.validateRequest(mockRFPRequest)).rejects.toThrow()
    })

    it('should throw a ValidationDuplicateError if RFPDataAgent returns data', async () => {
      mockRFPDataAgent.findByRdId.mockResolvedValueOnce(mockRFPRequestDocument)

      await expect(validator.validateRequest(mockRFPRequest)).rejects.toThrowError(ValidationDuplicateError)
    })

    it('should throw if CompanyregistryClient fails', async () => {
      mockCompanyRegistryClient.getAllMembersStaticIds.mockRejectedValueOnce(new Error())

      await expect(validator.validateRequest(mockRFPRequest)).rejects.toThrow()
    })

    it('should throw a ValidationFieldError if not all participants are komgo members', async () => {
      mockCompanyRegistryClient.getAllMembersStaticIds.mockResolvedValueOnce([STATIC_ID_0, STATIC_ID_1])

      await expect(
        validator.validateRequest({ ...mockRFPRequest, participantStaticIds: [STATIC_ID_0, 'nonMemberStaticId'] })
      ).rejects.toThrowError(ValidationFieldError)
    })
  })

  describe('validateRFPExists', () => {
    const RD_ID = '123'
    const RFP_ID = '123'
    const RFP = { rfpId: RFP_ID }

    it('should return a rfpId successfully', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce({ staticId: RD_ID } as any)
      mockRFPDataAgent.findByRdId.mockResolvedValueOnce(RFP as any)

      const result = await validator.validateRFPExistsByRdId(RD_ID)
      expect(result).toEqual(RFP)
    })

    it('should fail if the RD can not be found', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce(null)

      expect.assertions(2)
      try {
        await validator.validateRFPExistsByRdId(RD_ID)
      } catch (error) {
        expect(error).toBeInstanceOf(EntityNotFoundError)
        expect(error.message).toEqual(`RD does not exist with ID: ${RD_ID}`)
      }
    })

    it('should fail if the RFP can not be found', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce({ staticId: RD_ID } as any)
      mockRFPDataAgent.findByRdId.mockResolvedValueOnce(null)

      expect.assertions(2)
      try {
        await validator.validateRFPExistsByRdId(RD_ID)
      } catch (error) {
        expect(error).toBeInstanceOf(EntityNotFoundError)
        expect(error.message).toEqual('RD does not have an RFP')
      }
    })
  })

  describe('validateRFPReplyNotProcessed', () => {
    it('should return successfully if no RFP Reply in DB', async () => {
      await validator.validateRFPReplyNotProcessed(buildFakeReply())
      // Doesn't throw
    })

    it('should return successfully if RFP Reply is duplicate in DB', async () => {
      const rfpReply = buildFakeReply({ createdAt: Date.now() as any })
      mockReplyDataAgent.findByStaticId.mockResolvedValueOnce(rfpReply)

      await validator.validateRFPReplyNotProcessed(rfpReply)
      // Doesn't throw
    })

    it('should fail with InvalidPayloadProcessingError if RFP Reply is duplicate in DB with different createdAt value', async () => {
      const rfpReply = buildFakeReply()
      mockReplyDataAgent.findByStaticId.mockResolvedValueOnce(rfpReply)

      const newRFPReply = { ...rfpReply, createdAt: Date.now() as any }
      await expect(validator.validateRFPReplyNotProcessed(newRFPReply)).rejects.toThrowError(
        InvalidPayloadProcessingError
      )
    })
  })

  describe('validateInboundQuoteAccept', () => {
    const mockQuoteAcceptance: any = {
      rfpReply: { rdId: 'test-rd-id' }
    }

    it('should fail with ValidationFieldError if RD does not exists', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce(undefined)

      try {
        await validator.validateInboundQuoteAccept(mockQuoteAcceptance)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationFieldError)
        expect(error.message).toMatchInlineSnapshot(`"The specified Receivable discounting data could not be found"`)
      }
    })

    it('should fail with ValidationFieldError if RFP does not exists', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce({} as any)
      mockRFPDataAgent.findByRdId.mockResolvedValueOnce(undefined)

      try {
        await validator.validateInboundQuoteAccept(mockQuoteAcceptance)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationFieldError)
        expect(error.message).toMatchInlineSnapshot(
          `"A Request for proposal could not be found for the given Receivable discounting application"`
        )
      }
    })

    it('should fail with ValidationFieldError if no quote was submitted for the RD', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce({} as any)
      mockRFPDataAgent.findByRdId.mockResolvedValueOnce({} as any)
      mockRDInfoAggregator.createParticipantRFPSummaries.mockResolvedValueOnce([
        {
          ...mockParticipantRFPSummary,
          status: ParticipantRFPStatus.Rejected
        }
      ])

      try {
        await validator.validateInboundQuoteAccept(mockQuoteAcceptance)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationFieldError)
        expect(error.message).toMatchInlineSnapshot(
          `"The action cannot be performed for the specified Receivable Discounting application due to an invalid status"`
        )
      }
    })

    it('should fail with ValidationFieldError if the accept quote response was previously received for this RD', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce({} as any)
      mockRFPDataAgent.findByRdId.mockResolvedValueOnce({} as any)
      mockRDInfoAggregator.createParticipantRFPSummaries.mockResolvedValueOnce([
        {
          ...mockParticipantRFPSummary,
          status: ParticipantRFPStatus.QuoteAccepted
        }
      ])

      try {
        await validator.validateInboundQuoteAccept(mockQuoteAcceptance)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationDuplicateError)
        expect(error.message).toMatchInlineSnapshot(
          `"A reply has already been (sent / received) for the chosen RD application"`
        )
      }
    })

    it('should validate successfully if a quote was submitted', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce({} as any)
      mockRFPDataAgent.findByRdId.mockResolvedValueOnce({} as any)
      mockRDInfoAggregator.createParticipantRFPSummaries.mockResolvedValueOnce([
        {
          ...mockParticipantRFPSummary,
          status: ParticipantRFPStatus.QuoteSubmitted
        }
      ])

      const promise = validator.validateInboundQuoteAccept(mockQuoteAcceptance)

      await expect(promise).resolves.toEqual(undefined)
    })
  })

  describe('validateInboundQuoteDecline', () => {
    const mockQuoteDecline: any = {
      rfpReply: { rdId: 'test-rd-id' }
    }

    it('should fail with ValidationFieldError if RD does not exists', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce(undefined)

      try {
        await validator.validateInboundQuoteDecline(mockQuoteDecline)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationFieldError)
        expect(error.message).toMatchInlineSnapshot(`"The specified Receivable discounting data could not be found"`)
      }
    })

    it('should fail with ValidationFieldError if RFP does not exists', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce({} as any)
      mockRFPDataAgent.findByRdId.mockResolvedValueOnce(undefined)

      try {
        await validator.validateInboundQuoteDecline(mockQuoteDecline)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationFieldError)
        expect(error.message).toMatchInlineSnapshot(
          `"A Request for proposal could not be found for the given Receivable discounting application"`
        )
      }
    })

    it('should fail with ValidationFieldError if no quote was made for this RD', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce({} as any)
      mockRFPDataAgent.findByRdId.mockResolvedValueOnce({} as any)
      mockRDInfoAggregator.createParticipantRFPSummaries.mockResolvedValueOnce([
        {
          ...mockParticipantRFPSummary,
          status: ParticipantRFPStatus.Rejected
        }
      ])

      try {
        await validator.validateInboundQuoteDecline(mockQuoteDecline)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationFieldError)
        expect(error.message).toMatchInlineSnapshot(
          `"The action cannot be performed for the specified Receivable Discounting application due to an invalid status"`
        )
      }
    })

    it('should fail with ValidationFieldError if the decline quote response was previously received for this RD', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce({} as any)
      mockRFPDataAgent.findByRdId.mockResolvedValueOnce({} as any)
      mockRDInfoAggregator.createParticipantRFPSummaries.mockResolvedValueOnce([
        {
          ...mockParticipantRFPSummary,
          status: ParticipantRFPStatus.QuoteDeclined
        }
      ])

      try {
        await validator.validateInboundQuoteDecline(mockQuoteDecline)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationDuplicateError)
        expect(error.message).toMatchInlineSnapshot(
          `"A reply has already been (sent / received) for the chosen RD application"`
        )
      }
    })

    it('should validate successfully if a quote was submitted', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce({} as any)
      mockRFPDataAgent.findByRdId.mockResolvedValueOnce({} as any)
      mockRDInfoAggregator.createParticipantRFPSummaries.mockResolvedValueOnce([
        {
          ...mockParticipantRFPSummary,
          status: ParticipantRFPStatus.QuoteSubmitted
        }
      ])

      const promise = validator.validateInboundQuoteDecline(mockQuoteDecline)

      await expect(promise).resolves.toEqual(undefined)
    })

    it('should validate successfully if a quote was not submitted but the RD was requested', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce({} as any)
      mockRFPDataAgent.findByRdId.mockResolvedValueOnce({} as any)
      mockRDInfoAggregator.createParticipantRFPSummaries.mockResolvedValueOnce([
        {
          ...mockParticipantRFPSummary,
          status: ParticipantRFPStatus.Requested
        }
      ])

      const promise = validator.validateInboundQuoteDecline(mockQuoteDecline)

      await expect(promise).resolves.toEqual(undefined)
    })
  })

  describe('validateQuoteSubmission', () => {
    const mockRD = buildFakeReceivablesDiscountingExtended()
    const mockRFP = {
      rfpId: 'rfpId'
    }
    const mockQuote = {
      staticId: 'quoteId'
    }

    const mockQuoteSubmission = {
      rdId: mockRD.staticId,
      quoteId: mockQuote.staticId
    }

    beforeEach(() => {
      mockReplyDataAgent.findByRdId.mockResolvedValue(undefined)
      mockRdDataAgent.findByStaticId.mockResolvedValue(mockRD as any)
      mockRFPDataAgent.findByRdId.mockResolvedValue(mockRFP as any)
      mockQuoteDataAgent.findByStaticId.mockResolvedValue(mockQuote as any)
    })

    it('should return a RD, RFP and Quote successfully', async () => {
      const result = await validator.validateQuoteSubmission(mockQuoteSubmission)

      expect(mockQuoteValidator.validateFieldsExtended).toHaveBeenCalledWith(mockQuote, mockRD)
      expect(result).toEqual({ rd: mockRD, rfp: mockRFP, quote: mockQuote })
    })

    it('should fail with ValidationFieldError if a RFPReply already exists', async () => {
      mockReplyDataAgent.findByRdId.mockResolvedValueOnce({} as any)

      try {
        await validator.validateQuoteSubmission(mockQuoteSubmission)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationDuplicateError)
        expect(error.message).toEqual('A reply has already been sent for the chosen RD application')
      }
    })

    it('should fail with ValidationFieldError if RD does not exists', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValue(undefined)

      try {
        await validator.validateQuoteSubmission(mockQuoteSubmission)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationFieldError)
        expect(error.message).toEqual('The specified Receivable discounting data could not be found')
      }
    })

    it('should fail with ValidationFieldError if a RFP does not exists', async () => {
      mockRFPDataAgent.findByRdId.mockResolvedValue(undefined)

      try {
        await validator.validateQuoteSubmission(mockQuoteSubmission)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationFieldError)
        expect(error.message).toEqual(
          'A Request for proposal could not be found for the given Receivable discounting application'
        )
      }
    })

    it('should fail with ValidationFieldError if a quote does not exists', async () => {
      mockQuoteDataAgent.findByStaticId.mockResolvedValue(undefined)

      try {
        await validator.validateQuoteSubmission(mockQuoteSubmission)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationFieldError)
        expect(error.message).toEqual('The specified quote could not be found')
      }
    })
  })

  describe('validateRFPReject', () => {
    const mockRD = {
      staticId: 'rdId',
      rfpId: 'rfpId'
    }
    const mockRFP = {
      rfpId: mockRD.rfpId
    }

    const mockRFPReply = {
      rdId: mockRD.staticId
    }

    beforeEach(() => {
      mockReplyDataAgent.findByRdId.mockResolvedValue(undefined)
      mockRdDataAgent.findByStaticId.mockResolvedValue(mockRD as any)
      mockRFPDataAgent.findByRdId.mockResolvedValue(mockRFP as any)
    })

    it('should return a RD and RFP successfully', async () => {
      const result = await validator.validateRFPReject(mockRFPReply)
      expect(result).toEqual({ rd: mockRD, rfp: mockRFP })
    })

    it('should fail with ValidationFieldError if a RFPReply already exists', async () => {
      mockReplyDataAgent.findByRdId.mockResolvedValueOnce({} as any)

      try {
        await validator.validateRFPReject(mockRFPReply)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationDuplicateError)
        expect(error.message).toEqual('A reply has already been sent for the chosen RD application')
      }
    })

    it('should fail with ValidationFieldError if RD does not exists', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValue(undefined)

      try {
        await validator.validateRFPReject(mockRFPReply)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationFieldError)
        expect(error.message).toEqual('The specified Receivable discounting data could not be found')
      }
    })

    it('should fail with ValidationFieldError if a RFP does not exists', async () => {
      mockRFPDataAgent.findByRdId.mockResolvedValue(undefined)

      try {
        await validator.validateRFPReject(mockRFPReply)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationFieldError)
        expect(error.message).toEqual(
          'A Request for proposal could not be found for the given Receivable discounting application'
        )
      }
    })
  })

  describe('validateOutboundQuoteAccept', () => {
    const participantStaticId = 'pId'

    const mockRD = buildFakeReceivablesDiscountingExtended()
    const mockRFP = {
      rfpId: 'rfpId'
    }
    const mockQuote = {
      staticId: 'quoteId'
    }

    const mockQuoteAccept = {
      rdId: mockRD.staticId,
      quoteId: mockQuote.staticId,
      participantStaticId
    }

    beforeEach(() => {
      mockReplyDataAgent.findByRdId.mockResolvedValue(undefined)
      mockRdDataAgent.findByStaticId.mockResolvedValue(mockRD as any)
      mockRFPDataAgent.findByRdId.mockResolvedValue(mockRFP as any)
      mockQuoteDataAgent.findByStaticId.mockResolvedValue(mockQuote as any)
      mockRDInfoAggregator.createParticipantRFPSummaries.mockResolvedValue([mockParticipantRFPSummary])
    })

    it('should return a RD, RFP and Quote successfully', async () => {
      const result = await validator.validateOutboundQuoteAccept(mockQuoteAccept)

      expect(mockQuoteValidator.validateFieldsExtended).toHaveBeenCalledWith(mockQuote, mockRD)
      expect(result).toEqual({ rd: mockRD, rfp: mockRFP, quote: mockQuote })
    })

    it('should fail with ValidationFieldError if RD does not exists', async () => {
      mockRdDataAgent.findByStaticId.mockResolvedValue(undefined)

      try {
        await validator.validateOutboundQuoteAccept(mockQuoteAccept)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationFieldError)
        expect(error.message).toEqual('The specified Receivable discounting data could not be found')
      }
    })

    it('should fail with ValidationFieldError if a RFP does not exists', async () => {
      mockRFPDataAgent.findByRdId.mockResolvedValue(undefined)

      try {
        await validator.validateOutboundQuoteAccept(mockQuoteAccept)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationFieldError)
        expect(error.message).toEqual(
          'A Request for proposal could not be found for the given Receivable discounting application'
        )
      }
    })

    it('should fail with ValidationFieldError if a quote does not exists', async () => {
      mockQuoteDataAgent.findByStaticId.mockResolvedValue(undefined)

      try {
        await validator.validateOutboundQuoteAccept(mockQuoteAccept)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationFieldError)
        expect(error.message).toEqual('The specified quote could not be found')
      }
    })

    it('should fail with ValidationFieldError if the RFPSummary status is not Submitted', async () => {
      mockRDInfoAggregator.createParticipantRFPSummaries.mockResolvedValue([
        {
          ...mockParticipantRFPSummary,
          status: ParticipantRFPStatus.Rejected
        }
      ])

      try {
        await validator.validateOutboundQuoteAccept(mockQuoteAccept)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationFieldError)
        expect(error.message).toEqual(
          'The action cannot be performed for the specified Receivable Discounting application due to an invalid status'
        )
      }
    })

    it('should fail with ValidationDuplicateError if the RFPSummary status is already Accepted', async () => {
      mockRDInfoAggregator.createParticipantRFPSummaries.mockResolvedValue([
        {
          ...mockParticipantRFPSummary,
          status: ParticipantRFPStatus.QuoteAccepted
        }
      ])

      try {
        await validator.validateOutboundQuoteAccept(mockQuoteAccept)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationDuplicateError)
        expect(error.message).toEqual('A reply has already been (sent / received) for the chosen RD application')
      }
    })
  })
})
