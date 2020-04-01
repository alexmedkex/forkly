const mockCompanyRole = jest.fn()
jest.mock('../../../util/getCompanyLCRole', () => ({
  getCompanyLCRole: mockCompanyRole
}))

import 'reflect-metadata'
import { LCIssuedProcessor } from './LCIssuedProcessor'
import { COMPANY_LC_ROLE } from '../../../CompanyRole'
import { ILCTransitionEvent } from './ILCTransitionEvent'
import { LC_STATE } from '../LCStates'
import { ILCDocumentManager } from './LCDocumentManager'
import { DOCUMENT_TYPE } from '../../../documents/documentTypes'

describe('LCIssuedProcessor', () => {
  let processor
  const mockLc = {
    _id: '1',
    applicantId: 'app1',
    beneficiaryId: 'ben2',
    issuingBankId: 'iss1',
    direct: true,
    issueDueDate: {
      timerStaticId: 'timerStaticId'
    }
  }

  const mockedEvent: ILCTransitionEvent = {
    stateId: LC_STATE.ISSUED,
    blockNumber: 1,
    performerId: 'company'
  }

  const mockDocumentManager: ILCDocumentManager = {
    shareDocument: jest.fn(),
    deleteDocument: jest.fn()
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
    processor = new LCIssuedProcessor(
      'companyId',
      mockDocumentManager,
      mockVaktMessageNotifier,
      mockTaskProcessor,
      mockLCTimerService
    )
  })

  it('should call Vakt notification', async () => {
    await processor.processStateTransition(mockLc, mockedEvent)

    expect(mockVaktMessageNotifier.sendVaktMessage).toHaveBeenCalled()
  })

  describe('Issuing bank', () => {
    it('should share with applicant and beneficiary if direct', async () => {
      mockCompanyRole.mockImplementationOnce(() => COMPANY_LC_ROLE.IssuingBank)

      await processor.processStateTransition(mockLc, mockedEvent)

      // update task
      expect(mockTaskProcessor.resolveTask).toHaveBeenCalled()

      // share with applicant and beneficiary, for directLC
      expect(mockDocumentManager.shareDocument).toHaveBeenCalledWith(mockLc, DOCUMENT_TYPE.LC, [
        mockLc.applicantId,
        mockLc.beneficiaryId
      ])
      expect(mockLCTimerService.lcDeactiveIssuanceTimer).toHaveBeenCalled()
    })

    it('should share with applicant and beneficiary bank if not direct', async () => {
      const mockLc2 = { ...mockLc, beneficiaryBankId: 'testBeneficiaryBankId', direct: false }
      mockCompanyRole.mockImplementationOnce(() => COMPANY_LC_ROLE.IssuingBank)

      await processor.processStateTransition(mockLc2, mockedEvent)

      // update task
      expect(mockTaskProcessor.resolveTask).toHaveBeenCalled()

      // share with applicant and beneficiary, for directLC
      expect(mockDocumentManager.shareDocument).toHaveBeenCalledWith(mockLc2, DOCUMENT_TYPE.LC, [
        mockLc2.applicantId,
        mockLc2.beneficiaryBankId
      ])
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
