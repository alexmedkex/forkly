const mockCompanyRole = jest.fn()
jest.mock('../../../util/getCompanyLCRole', () => ({
  getCompanyLCRole: mockCompanyRole
}))

import 'reflect-metadata'
import { LCAdvisedProcessor } from './LCAdvisedProcessor'
import { COMPANY_LC_ROLE } from '../../../CompanyRole'
import { ILCTransitionEvent } from './ILCTransitionEvent'
import { LC_STATE } from '../LCStates'

describe('LCAdvisedProcessor', () => {
  let processor
  const mockLc = {
    _id: '1',
    applicantId: 'app1',
    beneficiaryId: 'ben2'
    // directLC, no beneficiaryBankId
  }

  const mockedEvent: ILCTransitionEvent = {
    stateId: LC_STATE.ADVISED,
    blockNumber: 1,
    performerId: 'company'
  }

  const mockDocumentManager = {
    shareDocument: jest.fn()
  }

  const mockVaktMessageNotifier = {
    sendVaktMessage: jest.fn()
  }

  const mockTaskProcessor = {
    createTask: jest.fn(),
    resolveTask: jest.fn()
  }

  beforeEach(() => {
    processor = new LCAdvisedProcessor('companyId', mockDocumentManager, mockVaktMessageNotifier, mockTaskProcessor)
  })

  it('should call Vakt notification', async () => {
    await processor.processStateTransition(mockLc, mockedEvent)

    expect(mockVaktMessageNotifier.sendVaktMessage).toHaveBeenCalled()
  })

  describe('Advising bank', () => {
    it('should process for Advising bank', async () => {
      mockCompanyRole.mockImplementationOnce(() => COMPANY_LC_ROLE.AdvisingBank)

      await processor.processStateTransition(mockLc, mockedEvent)

      // update task
      expect(mockTaskProcessor.resolveTask).toHaveBeenCalled()

      // share with applicant and beneficiary, for directLC
      const toShareWith = mockDocumentManager.shareDocument.mock.calls[0][2]
      expect(toShareWith).toEqual([mockLc.beneficiaryId])
      expect(mockDocumentManager.shareDocument).toHaveBeenCalled()
    })
  })

  describe('Beneficiary', () => {
    it('should process for Beneficiary', async () => {
      mockCompanyRole.mockImplementationOnce(() => COMPANY_LC_ROLE.Beneficiary)

      await processor.processStateTransition(mockLc, mockedEvent)

      // update task
      expect(mockTaskProcessor.createTask).toHaveBeenCalled()
    })

    it('should fail if task creation fails', async () => {
      mockCompanyRole.mockImplementationOnce(() => COMPANY_LC_ROLE.Beneficiary)
      mockTaskProcessor.createTask.mockImplementationOnce(() => {
        throw new Error('fail task creation')
      })

      await expect(processor.processStateTransition(mockLc, mockedEvent)).rejects.toMatchObject({
        message: 'fail task creation'
      })
    })
  })
})
