const mockCompanyRole = jest.fn()
jest.mock('../../../util/getCompanyLCRole', () => ({
  getCompanyLCRole: mockCompanyRole
}))

import 'reflect-metadata'
import { COMPANY_LC_ROLE } from '../../../CompanyRole'
import { LCRequestedProcessor } from './LCRequestedProcessor'
import { ILCTransitionEvent } from './ILCTransitionEvent'
import { LC_STATE } from '../LCStates'
import { DOCUMENT_TYPE } from '../../../documents/documentTypes'
import { TimerDurationUnit } from '@komgo/types'

const mockLc = {
  _id: '1',
  applicantId: 'app1',
  beneficiaryId: 'ben2',
  issuingBankId: 'iss1'
}

const mockLcNonDirect = {
  _id: '1',
  applicantId: 'app1',
  beneficiaryId: 'ben2',
  beneficiaryBankId: 'benBank',
  issuingBankId: 'iss1'
}

const mockedEvent: ILCTransitionEvent = {
  stateId: LC_STATE.ISSUED,
  blockNumber: 1,
  performerId: 'company'
}

describe('LCRequestedProcessor.test', () => {
  let processor
  const mockVaktMessageNotifier = {
    sendVaktMessage: jest.fn()
  }

  const mockTaskProcessor = {
    updateTask: jest.fn(),
    createTask: jest.fn(),
    resolveTask: jest.fn(),
    sendStateUpdatedNotification: jest.fn()
  }

  const mockDocumentManager = {
    shareDocument: jest.fn(),
    deleteDocument: jest.fn()
  }

  const mockLCTimerService = {
    lcIssuanceTimer: jest.fn(),
    lcDeactiveIssuanceTimer: jest.fn()
  }

  beforeEach(() => {
    mockLCTimerService.lcIssuanceTimer.mockReset()
    processor = new LCRequestedProcessor(
      'companyId',
      mockVaktMessageNotifier,
      mockTaskProcessor,
      mockDocumentManager,
      mockLCTimerService
    )
  })

  it('should create task if isssuing bank', async () => {
    await processor.processStateTransition(
      {
        issuingBankId: 'companyId'
      },
      {}
    )

    expect(mockTaskProcessor.createTask).toHaveBeenCalled()
  })

  describe('Applicant', () => {
    it('should share with relevant parties - directLC', async () => {
      mockCompanyRole.mockImplementationOnce(() => COMPANY_LC_ROLE.Applicant)

      await processor.processStateTransition(mockLc, mockedEvent)

      // update task
      expect(mockTaskProcessor.resolveTask).toHaveBeenCalled()

      // share with applicant and beneficiary, for directLC
      expect(mockDocumentManager.shareDocument).toHaveBeenCalledWith(mockLc, DOCUMENT_TYPE.LC_Application, [
        mockLc.issuingBankId,
        mockLc.beneficiaryId
      ])
    })

    it('should share with relevant parties - non directLC', async () => {
      mockCompanyRole.mockImplementationOnce(() => COMPANY_LC_ROLE.Applicant)

      await processor.processStateTransition(mockLcNonDirect, mockedEvent)

      // update task
      expect(mockTaskProcessor.resolveTask).toHaveBeenCalled()

      // share with applicant and beneficiary, for directLC
      expect(mockDocumentManager.shareDocument).toHaveBeenCalledWith(mockLcNonDirect, DOCUMENT_TYPE.LC_Application, [
        mockLcNonDirect.issuingBankId,
        mockLcNonDirect.beneficiaryId,
        mockLcNonDirect.beneficiaryBankId
      ])
    })

    it('should create timer', async () => {
      mockCompanyRole.mockImplementationOnce(() => COMPANY_LC_ROLE.Applicant)

      await processor.processStateTransition(
        {
          ...mockLc,
          issueDueDate: {
            unit: TimerDurationUnit.Days,
            duration: 2
          }
        },
        mockedEvent
      )
      expect(mockLCTimerService.lcIssuanceTimer).toHaveBeenCalled()
    })
  })
  describe('Issuing', () => {
    it('should create timer', async () => {
      mockCompanyRole.mockImplementationOnce(() => COMPANY_LC_ROLE.IssuingBank)

      await processor.processStateTransition(
        {
          ...mockLc,
          issueDueDate: {
            unit: TimerDurationUnit.Days,
            duration: 2
          }
        },
        mockedEvent
      )
      expect(mockLCTimerService.lcIssuanceTimer).toHaveBeenCalled()
    })
  })
})
