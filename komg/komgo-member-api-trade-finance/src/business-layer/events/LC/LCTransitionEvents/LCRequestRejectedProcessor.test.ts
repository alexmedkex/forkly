import 'reflect-metadata'

const mockCompanyRole = jest.fn()
jest.mock('../../../util/getCompanyLCRole', () => ({
  getCompanyLCRole: mockCompanyRole
}))

import { LCRequestRejectedProcessor } from './LCRequestRejectedProcessor'
import { ILCTransitionEvent } from './ILCTransitionEvent'
import { LC_STATE } from '../LCStates'
import { COMPANY_LC_ROLE } from '../../../CompanyRole'

describe('LCRequestRejectedProcessor', () => {
  let processor
  const mockLc = {
    _id: '1',
    applicantId: 'app1',
    beneficiaryId: 'ben2',
    issueDueDate: {
      timerStaticId: 'timerStaticId'
    }
    // directLC, no beneficiaryBankId
  }

  const mockedEvent: ILCTransitionEvent = {
    stateId: LC_STATE.REQUEST_REJECTED,
    blockNumber: 1,
    performerId: 'company'
  }

  const mockVaktMessageNotifier = {
    sendVaktMessage: jest.fn()
  }

  const mockTaskProcessor = {
    createTask: jest.fn(),
    resolveTask: jest.fn()
  }

  const mockLCTimerService = {
    lcIssuanceTimer: jest.fn(),
    lcDeactiveIssuanceTimer: jest.fn()
  }

  beforeEach(() => {
    mockLCTimerService.lcDeactiveIssuanceTimer.mockReset()
    processor = new LCRequestRejectedProcessor(
      'companyId',
      mockVaktMessageNotifier,
      mockTaskProcessor,
      mockLCTimerService
    )
  })

  describe('Issuing bank', () => {
    it('should process', async () => {
      mockCompanyRole.mockImplementationOnce(() => COMPANY_LC_ROLE.IssuingBank)

      await processor.processStateTransition(mockLc, mockedEvent)

      // update task
      expect(mockTaskProcessor.resolveTask).toHaveBeenCalled()
      expect(mockLCTimerService.lcDeactiveIssuanceTimer).toHaveBeenCalled()
    })
  })

  describe('Applicant', () => {
    it('should process', async () => {
      mockCompanyRole.mockImplementationOnce(() => COMPANY_LC_ROLE.Applicant)

      await processor.processStateTransition(mockLc, mockedEvent)

      // update task
      expect(mockTaskProcessor.createTask).toHaveBeenCalled()
      expect(mockVaktMessageNotifier.sendVaktMessage).toHaveBeenCalled()
    })
  })
})
