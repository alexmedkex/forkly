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
import { LetterOfCreditPartyActionProcessorOnRequestRejected } from './LetterOfCreditPartyActionProcessorOnRequestRejected'
import { LetterOfCreditPartyActionProcessorHelper } from './LetterOfCreditPartyActionProcessorHelper'
import { ILetterOfCreditPartyActionProcessorHelper } from './ILetterOfCreditPartyActionProcessorHelper'
import { ICompanyRegistryService } from '../../../service-layer/ICompanyRegistryService'
import CompanyRegistryService from '../../../service-layer/CompanyRegistryService'
import { LetterOfCreditTimerService, ILetterOfCreditTimerService } from '../../timers/LetterOfCreditTimerService'

describe('LetterOfCreditPartyActionProcessorOnRequestRejected', () => {
  let letterOfCreditPartyActionProcessorOnRequestRejected: ILetterOfCreditPartyActionProcessor
  let letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>
  let mockLetterOfCreditTaskManager: jest.Mocked<ILetterOfCreditTaskManager>
  let mockLetterOfCreditNotificationManager: jest.Mocked<ILetterOfCreditNotificationManager>
  let mockLetterOfCreditMessagingService: jest.Mocked<ILetterOfCreditMessagingService>
  let letterOfCreditPartyActionProcessorHelper: ILetterOfCreditPartyActionProcessorHelper
  let mockCompanyRegistryService: jest.Mocked<ICompanyRegistryService>
  let mockMessagingService: jest.Mocked<ILetterOfCreditMessagingService>
  let mockLetterOfCreditTimerService: jest.Mocked<ILetterOfCreditTimerService>

  beforeEach(() => {
    letterOfCredit = buildFakeLetterOfCredit({
      status: LetterOfCreditStatus.RequestRejected
    })
    mockLetterOfCreditTaskManager = createMockInstance(LetterOfCreditTaskManager)
    mockLetterOfCreditNotificationManager = createMockInstance(LetterOfCreditNotificationManager)
    mockLetterOfCreditMessagingService = createMockInstance(LetterOfCreditMessagingService)
    mockCompanyRegistryService = createMockInstance(CompanyRegistryService)
    mockMessagingService = createMockInstance(LetterOfCreditMessagingService)
    mockLetterOfCreditTimerService = createMockInstance(LetterOfCreditTimerService)

    mockLetterOfCreditMessagingService.sendMessageTo.mockImplementation(() => {
      Promise.resolve('messageId')
    })
  })

  describe('executePartyActions', () => {
    it('should create a notification to review WHEN party is APPLICANT', async () => {
      const { applicant, issuingBank } = letterOfCredit.templateInstance.data
      const issuingBankName = issuingBank.x500Name.CN

      const applicantStaticId = applicant.staticId

      letterOfCreditPartyActionProcessorHelper = new LetterOfCreditPartyActionProcessorHelper(applicantStaticId)

      letterOfCreditPartyActionProcessorOnRequestRejected = new LetterOfCreditPartyActionProcessorOnRequestRejected(
        mockLetterOfCreditTaskManager,
        mockLetterOfCreditNotificationManager,
        letterOfCreditPartyActionProcessorHelper,
        mockCompanyRegistryService,
        mockMessagingService,
        mockLetterOfCreditTimerService
      )
      letterOfCredit.templateInstance.data.issueDueDate = {
        duration: 2,
        unit: TimerDurationUnit.Weeks,
        timerType: TimerType.CalendarDays
      }

      await letterOfCreditPartyActionProcessorOnRequestRejected.executePartyActions(letterOfCredit)

      expect(mockLetterOfCreditNotificationManager.createNotification).toHaveBeenCalledTimes(1)
      expect(mockLetterOfCreditNotificationManager.createNotification).toHaveBeenCalledWith(
        letterOfCredit,
        `Request for Letter of credit [${letterOfCredit.reference}] [${
          letterOfCredit.templateInstance.data.issuingBankReference
        }] rejected by ${issuingBankName}`,
        {},
        LetterOfCreditTaskType.ReviewIssued,
        TRADE_FINANCE_ACTION.ReviewIssuedLC
      )
      expect(mockLetterOfCreditTimerService.deactivateTimer).toHaveBeenCalled()
    })

    it('should create a notification to review WHEN party is BENEFICIARY', async () => {
      const { beneficiary, issuingBank } = letterOfCredit.templateInstance.data
      const issuingBankName = issuingBank.x500Name.CN

      const beneficiaryStaticId = beneficiary.staticId

      letterOfCreditPartyActionProcessorHelper = new LetterOfCreditPartyActionProcessorHelper(beneficiaryStaticId)

      letterOfCreditPartyActionProcessorOnRequestRejected = new LetterOfCreditPartyActionProcessorOnRequestRejected(
        mockLetterOfCreditTaskManager,
        mockLetterOfCreditNotificationManager,
        letterOfCreditPartyActionProcessorHelper,
        mockCompanyRegistryService,
        mockMessagingService,
        mockLetterOfCreditTimerService
      )

      await letterOfCreditPartyActionProcessorOnRequestRejected.executePartyActions(letterOfCredit)

      expect(mockLetterOfCreditNotificationManager.createNotification).toHaveBeenCalledTimes(1)
      expect(mockLetterOfCreditNotificationManager.createNotification).toHaveBeenCalledWith(
        letterOfCredit,
        `Request for Letter of credit [${letterOfCredit.reference}] [${
          letterOfCredit.templateInstance.data.issuingBankReference
        }] rejected by ${issuingBankName}`,
        {},
        LetterOfCreditTaskType.ReviewIssued,
        TRADE_FINANCE_ACTION.ReviewIssuedLC
      )
    })

    it('should resolve a task WHEN party is ISSUINGBANK', async () => {
      const { issuingBank } = letterOfCredit.templateInstance.data

      const issuingBankStaticId = issuingBank.staticId

      letterOfCreditPartyActionProcessorHelper = new LetterOfCreditPartyActionProcessorHelper(issuingBankStaticId)

      letterOfCreditPartyActionProcessorOnRequestRejected = new LetterOfCreditPartyActionProcessorOnRequestRejected(
        mockLetterOfCreditTaskManager,
        mockLetterOfCreditNotificationManager,
        letterOfCreditPartyActionProcessorHelper,
        mockCompanyRegistryService,
        mockMessagingService,
        mockLetterOfCreditTimerService
      )

      mockCompanyRegistryService.getMembers.mockImplementationOnce(() =>
        Promise.resolve([{ staticId: 'staticId1', isMember: true }, { staticId: 'staticId2', isMember: false }])
      )
      letterOfCredit.templateInstance.data.issueDueDate = {
        duration: 2,
        unit: TimerDurationUnit.Weeks,
        timerType: TimerType.CalendarDays
      }
      await letterOfCreditPartyActionProcessorOnRequestRejected.executePartyActions(letterOfCredit)

      expect(mockLetterOfCreditTaskManager.resolveTask).toHaveBeenCalledTimes(1)
      expect(mockLetterOfCreditTaskManager.resolveTask).toHaveBeenCalledWith(
        letterOfCredit,
        LetterOfCreditTaskType.ReviewRequested,
        true
      )
      expect(mockLetterOfCreditTimerService.deactivateTimer).toHaveBeenCalled()
    })
  })
})
