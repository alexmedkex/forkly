import 'reflect-metadata'

const mockCompanyRole = jest.fn()
jest.mock('../../../util/getCompanyLCRole', () => ({
  getCompanyLCRole: mockCompanyRole
}))

import { LCAcknowledgedProcessor } from './LCAcknowledgedProcessor'
import { ILCTransitionEvent } from './ILCTransitionEvent'
import { LC_STATE } from '../LCStates'
import { COMPANY_LC_ROLE } from '../../../CompanyRole'
import { ILCTaskProcessor } from '../../../tasks/LCTaskProcessor'

describe('LCAcknowledgedProcessor', () => {
  let processor
  const mockLc = {
    _id: '1',
    applicantId: 'app1',
    beneficiaryId: 'ben2'
    // directLC, no beneficiaryBankId
  }

  const mockedEvent: ILCTransitionEvent = {
    stateId: LC_STATE.ACKNOWLEDGED,
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
    processor = new LCAcknowledgedProcessor('companyId', mockVaktMessageNotifier, mockTaskProcessor)
  })

  describe('Benefitiary', () => {
    it('should process', async () => {
      mockCompanyRole.mockImplementationOnce(() => COMPANY_LC_ROLE.Beneficiary)

      await processor.processStateTransition(mockLc, mockedEvent)

      // update task
      expect(mockTaskProcessor.resolveTask).toHaveBeenCalled()
      expect(mockTaskProcessor.createTask).toHaveBeenCalled()
    })
  })
})
