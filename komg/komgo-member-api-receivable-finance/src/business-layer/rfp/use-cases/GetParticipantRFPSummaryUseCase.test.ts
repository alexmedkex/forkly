import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ReplyDataAgent } from '../../../data-layer/data-agents'
import { buildFakeReply } from '../../../data-layer/data-agents/utils/faker'
import { EntityNotFoundError } from '../../errors'
import { RDInfoAggregator } from '../../rd/RDInfoAggregator'
import { RFPValidator } from '../../validation'

import { GetParticipantRFPSummaryUseCase } from './GetParticipantRFPSummaryUseCase'

const mockRFP = {
  participantStaticIds: ['staticId0', 'staticId1']
}
const mockSummaries = [
  { participantStaticId: mockRFP.participantStaticIds[0] },
  { participantStaticId: mockRFP.participantStaticIds[1] }
]

describe('GetParticipantRFPSummaryUseCase', () => {
  let useCase: GetParticipantRFPSummaryUseCase
  let mockRFPValidator: jest.Mocked<RFPValidator>
  let mockReplyDataAgent: jest.Mocked<ReplyDataAgent>
  let mockRDInfoAggregator: jest.Mocked<RDInfoAggregator>

  beforeEach(() => {
    mockRFPValidator = createMockInstance(RFPValidator)
    mockReplyDataAgent = createMockInstance(ReplyDataAgent)
    mockRDInfoAggregator = createMockInstance(RDInfoAggregator)

    mockRFPValidator.validateRFPExistsByRdId.mockResolvedValue(mockRFP as any)
    mockReplyDataAgent.findAllByRdId.mockResolvedValue([buildFakeReply()])
    mockRDInfoAggregator.createParticipantRFPSummaries.mockResolvedValue(mockSummaries as any)

    useCase = new GetParticipantRFPSummaryUseCase(mockRFPValidator, mockReplyDataAgent, mockRDInfoAggregator)
  })

  describe('execute', () => {
    it('should execute the use case successfully', async () => {
      const result = await useCase.execute('rdId', 'participantId')

      expect(result).toEqual(mockSummaries[0])

      expect(mockRFPValidator.validateRFPExistsByRdId).toHaveBeenCalled()
      expect(mockReplyDataAgent.findAllByRdId).toHaveBeenCalled()
      expect(mockReplyDataAgent.findAllByRdId).toHaveBeenCalledWith('rdId', 'participantId')
      expect(mockRDInfoAggregator.createParticipantRFPSummaries).toHaveBeenCalled()
    })

    it('should throw EntityNotFound if replies doesnt exist', async () => {
      mockReplyDataAgent.findAllByRdId.mockResolvedValue([])

      try {
        await useCase.execute('rdId', 'participantId')
        fail('Failure')
      } catch (error) {
        expect(mockRFPValidator.validateRFPExistsByRdId).toHaveBeenCalled()
        expect(mockReplyDataAgent.findAllByRdId).toHaveBeenCalled()
        expect(error).toBeInstanceOf(EntityNotFoundError)
      }
    })

    it('should throw EntityNotFound if summaries doesnt exist', async () => {
      mockRDInfoAggregator.createParticipantRFPSummaries.mockResolvedValue([])

      try {
        await useCase.execute('rdId', 'participantId')
        fail('Failure')
      } catch (error) {
        expect(mockRFPValidator.validateRFPExistsByRdId).toHaveBeenCalled()
        expect(mockReplyDataAgent.findAllByRdId).toHaveBeenCalled()
        expect(mockRDInfoAggregator.createParticipantRFPSummaries).toHaveBeenCalled()
        expect(error).toBeInstanceOf(EntityNotFoundError)
      }
    })
  })
})
