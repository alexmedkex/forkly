import 'reflect-metadata'

const mockCompanyRole = jest.fn()
jest.mock('../../../util/getCompanyLCRole', () => ({
  getCompanyLCRole: mockCompanyRole
}))

import { LCRejectIssuedProcessor } from './LCRejectIssuedProcessor'
import { ILCTransitionEvent } from './ILCTransitionEvent'
import { LC_STATE } from '../LCStates'
import { COMPANY_LC_ROLE } from '../../../CompanyRole'

describe('LCRejectIssuedProcessor', () => {
  let processor
  const mockLc = {
    _id: '1',
    applicantId: 'app1',
    beneficiaryId: 'ben2'
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

  beforeEach(() => {
    processor = new LCRejectIssuedProcessor('companyId', mockVaktMessageNotifier, mockTaskProcessor)
  })

  describe('Issuing bank', () => {
    it('should process', async () => {
      mockCompanyRole.mockImplementationOnce(() => COMPANY_LC_ROLE.IssuingBank)

      await processor.processStateTransition(mockLc, mockedEvent)

      // update task
      expect(mockTaskProcessor.resolveTask).toHaveBeenCalled()
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
