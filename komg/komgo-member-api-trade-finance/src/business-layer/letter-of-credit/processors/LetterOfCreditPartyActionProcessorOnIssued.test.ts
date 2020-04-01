import 'reflect-metadata'
import createMockInstance from 'jest-create-mock-instance'

import {
  ILetterOfCredit,
  buildFakeLetterOfCredit,
  LetterOfCreditTaskType,
  IDataLetterOfCredit,
  LetterOfCreditStatus,
  TimerDurationUnit,
  TimerType
} from '@komgo/types'

import { ILetterOfCreditNotificationManager } from '../notifications/ILetterOfCreditNotificationManager'
import { LetterOfCreditNotificationManager } from '../notifications/LetterOfCreditNotificationManager'
import { ILetterOfCreditMessagingService } from '../messaging/ILetterOfCreditMessagingService'
import { LetterOfCreditMessagingService } from '../messaging/LetterOfCreditMessagingService'
import { ILetterOfCreditTaskManager } from '../tasks/ILetterOfCreditTaskManager'
import { LetterOfCreditTaskManager } from '../tasks/LetterOfCreditTaskManager'
import { ILetterOfCreditPartyActionProcessor } from './ILetterOfCreditPartyActionProcessor'
import { TRADE_FINANCE_ACTION } from '../../tasks/permissions'
import { LetterOfCreditPartyActionProcessorOnIssued } from './LetterOfCreditPartyActionProcessorOnIssued'
import { LetterOfCreditPartyActionProcessorHelper } from './LetterOfCreditPartyActionProcessorHelper'
import { ILetterOfCreditPartyActionProcessorHelper } from './ILetterOfCreditPartyActionProcessorHelper'
import { ILetterOfCreditDocumentService } from '../services/ILetterOfCreditDocumentService'
import { LetterOfCreditDocumentService } from '../services/LetterOfCreditDocumentService'
import { DOCUMENT_TYPE } from '../../documents/documentTypes'
import { ICompanyRegistryService } from '../../../service-layer/ICompanyRegistryService'
import CompanyRegistryService from '../../../service-layer/CompanyRegistryService'
import { ILetterOfCreditTimerService, LetterOfCreditTimerService } from '../../timers/LetterOfCreditTimerService'

const when = describe

describe('LetterOfCreditPartyActionProcessorOnIssued', () => {
  const kapsuleBaseUrl = 'kapsuleUrl'

  let letterOfCreditPartyActionProcessorOnIssued: ILetterOfCreditPartyActionProcessor
  let letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>
  let mockLetterOfCreditTaskManager: jest.Mocked<ILetterOfCreditTaskManager>
  let mockLetterOfCreditNotificationManager: jest.Mocked<ILetterOfCreditNotificationManager>
  let mockLetterOfCreditMessagingService: jest.Mocked<ILetterOfCreditMessagingService>
  let letterOfCreditPartyActionProcessorHelper: ILetterOfCreditPartyActionProcessorHelper
  let mockLetterOfCreditDocumentService: jest.Mocked<ILetterOfCreditDocumentService>
  let mockCompanyRegistryService: jest.Mocked<ICompanyRegistryService>
  let mockMessagingService: jest.Mocked<ILetterOfCreditMessagingService>
  let mockLetterOfCreditTimerService: jest.Mocked<ILetterOfCreditTimerService>

  beforeEach(() => {
    letterOfCredit = buildFakeLetterOfCredit({
      status: LetterOfCreditStatus.Issued
    })
    mockLetterOfCreditTaskManager = createMockInstance(LetterOfCreditTaskManager)
    mockLetterOfCreditNotificationManager = createMockInstance(LetterOfCreditNotificationManager)
    mockLetterOfCreditMessagingService = createMockInstance(LetterOfCreditMessagingService)
    mockLetterOfCreditDocumentService = createMockInstance(LetterOfCreditDocumentService)
    mockCompanyRegistryService = createMockInstance(CompanyRegistryService)
    mockMessagingService = createMockInstance(LetterOfCreditMessagingService)
    mockLetterOfCreditTimerService = createMockInstance(LetterOfCreditTimerService)
    mockLetterOfCreditMessagingService.sendMessageTo.mockImplementation(() => {
      Promise.resolve('messageId')
    })
  })

  describe('executePartyActions', () => {
    when('party is APPLICANT', () => {
      it('should create a notification that the letter of credit has been issued', async () => {
        const { applicant, issuingBank } = letterOfCredit.templateInstance.data
        // const letterOfCreditWithIssuedStatus: ILetterOfCredit<IDataLetterOfCredit> = {
        //   ...letterOfCredit,
        //   status: LetterOfCreditStatus.Issued
        // }
        const issuingBankName = issuingBank.x500Name.CN

        const applicantStaticId = applicant.staticId

        letterOfCreditPartyActionProcessorHelper = new LetterOfCreditPartyActionProcessorHelper(applicantStaticId)

        letterOfCreditPartyActionProcessorOnIssued = new LetterOfCreditPartyActionProcessorOnIssued(
          mockLetterOfCreditTaskManager,
          mockLetterOfCreditNotificationManager,
          letterOfCreditPartyActionProcessorHelper,
          mockLetterOfCreditDocumentService,
          kapsuleBaseUrl,
          mockCompanyRegistryService,
          mockMessagingService,
          mockLetterOfCreditTimerService
        )
        letterOfCredit.templateInstance.data.issueDueDate = {
          duration: 2,
          unit: TimerDurationUnit.Weeks,
          timerType: TimerType.CalendarDays
        }
        letterOfCredit.templateInstance.data.issueDueDate = {
          duration: 2,
          unit: TimerDurationUnit.Weeks,
          timerType: TimerType.CalendarDays
        }
        await letterOfCreditPartyActionProcessorOnIssued.executePartyActions(letterOfCredit)

        expect(mockLetterOfCreditNotificationManager.createNotification).toHaveBeenCalledTimes(1)
        expect(mockLetterOfCreditNotificationManager.createNotification).toHaveBeenCalledWith(
          letterOfCredit,
          `Request for Letter of credit [${letterOfCredit.reference}] [${
            letterOfCredit.templateInstance.data.issuingBankReference
          }] issued by ${issuingBankName}`,
          {},
          LetterOfCreditTaskType.ReviewIssued,
          TRADE_FINANCE_ACTION.ReviewIssuedLC
        )
        expect(mockLetterOfCreditTimerService.deactivateTimer).toHaveBeenCalled()
      })
    })

    when('party is BENEFICIARY', () => {
      it('should create a task to review letter of credit', async () => {
        const { beneficiary, issuingBank } = letterOfCredit.templateInstance.data
        const beneficiaryStaticId = beneficiary.staticId
        const issuingBankName = issuingBank.x500Name.CN

        letterOfCreditPartyActionProcessorHelper = new LetterOfCreditPartyActionProcessorHelper(beneficiaryStaticId)

        letterOfCreditPartyActionProcessorOnIssued = new LetterOfCreditPartyActionProcessorOnIssued(
          mockLetterOfCreditTaskManager,
          mockLetterOfCreditNotificationManager,
          letterOfCreditPartyActionProcessorHelper,
          mockLetterOfCreditDocumentService,
          kapsuleBaseUrl,
          mockCompanyRegistryService,
          mockMessagingService,
          mockLetterOfCreditTimerService
        )
        letterOfCredit.templateInstance.data.issueDueDate = {
          duration: 2,
          unit: TimerDurationUnit.Weeks,
          timerType: TimerType.CalendarDays
        }

        await letterOfCreditPartyActionProcessorOnIssued.executePartyActions(letterOfCredit)

        expect(mockLetterOfCreditTaskManager.createTask).toHaveBeenCalledTimes(1)
        expect(mockLetterOfCreditTaskManager.createTask).toHaveBeenCalledWith(
          letterOfCredit,
          `Request for Letter of credit [${letterOfCredit.reference}] [${
            letterOfCredit.templateInstance.data.issuingBankReference
          }] issued by ${issuingBankName}`,
          LetterOfCreditTaskType.ReviewIssued,
          TRADE_FINANCE_ACTION.ReviewIssuedLC,
          {
            subject: 'Letter of credit Issued',
            emailTaskTitle: 'Review Letter of credit Issued',
            emailTaskLink: `${kapsuleBaseUrl}/tasks`
          }
        )
      })
    })

    when('party is ISSUING BANK', () => {
      beforeEach(() => {
        const { issuingBank } = letterOfCredit.templateInstance.data

        const issuingBankStaticId = issuingBank.staticId

        letterOfCreditPartyActionProcessorHelper = new LetterOfCreditPartyActionProcessorHelper(issuingBankStaticId)

        letterOfCreditPartyActionProcessorOnIssued = new LetterOfCreditPartyActionProcessorOnIssued(
          mockLetterOfCreditTaskManager,
          mockLetterOfCreditNotificationManager,
          letterOfCreditPartyActionProcessorHelper,
          mockLetterOfCreditDocumentService,
          kapsuleBaseUrl,
          mockCompanyRegistryService,
          mockMessagingService,
          mockLetterOfCreditTimerService
        )
      })

      it('should resolve review task only if not document hash', async () => {
        mockCompanyRegistryService.getMembers.mockImplementationOnce(() =>
          Promise.resolve([{ staticId: 'staticId1', isMember: true }, { staticId: 'staticId2', isMember: false }])
        )
        letterOfCredit.templateInstance.data.issueDueDate = {
          duration: 2,
          unit: TimerDurationUnit.Weeks,
          timerType: TimerType.CalendarDays
        }
        await letterOfCreditPartyActionProcessorOnIssued.executePartyActions(letterOfCredit)

        expect(mockLetterOfCreditTaskManager.resolveTask).toHaveBeenCalledTimes(1)
        expect(mockLetterOfCreditTaskManager.resolveTask).toHaveBeenCalledWith(
          letterOfCredit,
          LetterOfCreditTaskType.ReviewRequested,
          true
        )
        expect(mockLetterOfCreditTimerService.deactivateTimer).toHaveBeenCalled()
      })

      it('should resolve review task and share the letter of credit document if it has an issuing bank document', async () => {
        mockCompanyRegistryService.getMembers.mockImplementationOnce(() =>
          Promise.resolve([{ staticId: 'staticId1', isMember: true }, { staticId: 'staticId2', isMember: false }])
        )
        const anotherLetterOfCredit = {
          ...letterOfCredit,
          issuingDocumentHash: '0x0'
        }
        const { applicant } = anotherLetterOfCredit.templateInstance.data

        await letterOfCreditPartyActionProcessorOnIssued.executePartyActions(anotherLetterOfCredit)

        expect(mockLetterOfCreditTaskManager.resolveTask).toHaveBeenCalledTimes(1)
        expect(mockLetterOfCreditTaskManager.resolveTask).toHaveBeenCalledWith(
          anotherLetterOfCredit,
          LetterOfCreditTaskType.ReviewRequested,
          true
        )

        expect(mockLetterOfCreditDocumentService.shareDocument).toBeCalledTimes(1)
        expect(mockLetterOfCreditDocumentService.shareDocument).toHaveBeenCalledWith(
          anotherLetterOfCredit,
          DOCUMENT_TYPE.LC,
          [applicant.staticId]
        )
      })
    })
  })
})
