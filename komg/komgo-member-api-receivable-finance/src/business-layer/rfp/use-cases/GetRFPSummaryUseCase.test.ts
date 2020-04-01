import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ReplyDataAgent } from '../../../data-layer/data-agents'
import { buildFakeReply } from '../../../data-layer/data-agents/utils/faker'
import { RDInfoAggregator } from '../../rd/RDInfoAggregator'
import { RFPValidator } from '../../validation'

import { GetRFPSummaryUseCase } from './GetRFPSummaryUseCase'

const mockRFP = {
  participantStaticIds: ['staticId0', 'staticId1']
}
const mockSummaries = [
  { participantStaticId: mockRFP.participantStaticIds[0] },
  { participantStaticId: mockRFP.participantStaticIds[1] }
]

describe('GetRFPSummaryUseCase', () => {
  let useCase: GetRFPSummaryUseCase
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

    useCase = new GetRFPSummaryUseCase(mockRFPValidator, mockReplyDataAgent, mockRDInfoAggregator)
  })

  describe('execute', () => {
    it('should execute the use case successfully', async () => {
      const result = await useCase.execute('rdId')

      expect(result).toEqual(mockSummaries)
      expect(mockRFPValidator.validateRFPExistsByRdId).toHaveBeenCalled()
      expect(mockReplyDataAgent.findAllByRdId).toHaveBeenCalled()
      expect(mockRDInfoAggregator.createParticipantRFPSummaries).toHaveBeenCalled()
    })
  })
})
