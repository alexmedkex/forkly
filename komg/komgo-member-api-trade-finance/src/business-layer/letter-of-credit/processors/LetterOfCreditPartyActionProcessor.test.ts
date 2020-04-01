import 'reflect-metadata'
import createMockInstance from 'jest-create-mock-instance'

import { ILetterOfCredit, buildFakeLetterOfCredit, IDataLetterOfCredit, LetterOfCreditStatus } from '@komgo/types'

import { ILetterOfCreditPartyActionProcessor } from './ILetterOfCreditPartyActionProcessor'
import { LetterOfCreditPartyActionProcessor } from './LetterOfCreditPartyActionProcessor'
import { LetterOfCreditPartyActionProcessorOnRequested } from './LetterOfCreditPartyActionProcessorOnRequested'
import { LetterOfCreditPartyActionProcessorOnRequestRejected } from './LetterOfCreditPartyActionProcessorOnRequestRejected'
import { LetterOfCreditPartyActionProcessorOnIssued } from './LetterOfCreditPartyActionProcessorOnIssued'

describe('LetterOfCreditPartyActionProcessor', () => {
  let letterOfCreditPartyActionProcessor: ILetterOfCreditPartyActionProcessor
  let letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>
  let mockOnRequestedProcessor: jest.Mocked<ILetterOfCreditPartyActionProcessor>
  let mockOnRequestRejectedProcessor: jest.Mocked<ILetterOfCreditPartyActionProcessor>
  let mockOnIssuedProcessor: jest.Mocked<ILetterOfCreditPartyActionProcessor>

  describe('executePartyActions', () => {
    beforeEach(() => {
      mockOnRequestedProcessor = createMockInstance(LetterOfCreditPartyActionProcessorOnRequested)
      mockOnRequestRejectedProcessor = createMockInstance(LetterOfCreditPartyActionProcessorOnRequestRejected)
      mockOnIssuedProcessor = createMockInstance(LetterOfCreditPartyActionProcessorOnIssued)

      letterOfCredit = buildFakeLetterOfCredit()

      letterOfCreditPartyActionProcessor = new LetterOfCreditPartyActionProcessor(
        mockOnRequestRejectedProcessor,
        mockOnRequestedProcessor,
        mockOnIssuedProcessor
      )
    })

    it('should call Requested Processor', async () => {
      const lcWithStatusRequested: ILetterOfCredit<IDataLetterOfCredit> = {
        ...letterOfCredit,
        status: LetterOfCreditStatus.Requested
      }
      await letterOfCreditPartyActionProcessor.executePartyActions(lcWithStatusRequested)

      expect(mockOnRequestedProcessor.executePartyActions).toHaveBeenCalledTimes(1)
      expect(mockOnRequestedProcessor.executePartyActions).toHaveBeenCalledWith(lcWithStatusRequested)
    })

    it('should call Request Rejected Processor', async () => {
      const lcWithStatusRequestRejected: ILetterOfCredit<IDataLetterOfCredit> = {
        ...letterOfCredit,
        status: LetterOfCreditStatus.RequestRejected
      }

      await letterOfCreditPartyActionProcessor.executePartyActions(lcWithStatusRequestRejected)

      expect(mockOnRequestRejectedProcessor.executePartyActions).toHaveBeenCalledTimes(1)
      expect(mockOnRequestRejectedProcessor.executePartyActions).toHaveBeenCalledWith(lcWithStatusRequestRejected)
    })

    it('should call Issued Processor', async () => {
      const lcWithStatusIssuedd: ILetterOfCredit<IDataLetterOfCredit> = {
        ...letterOfCredit,
        status: LetterOfCreditStatus.Issued
      }

      await letterOfCreditPartyActionProcessor.executePartyActions(lcWithStatusIssuedd)

      expect(mockOnIssuedProcessor.executePartyActions).toHaveBeenCalledTimes(1)
      expect(mockOnIssuedProcessor.executePartyActions).toHaveBeenCalledWith(lcWithStatusIssuedd)
    })
  })
})
