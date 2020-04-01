import 'reflect-metadata'
import createMockInstance from 'jest-create-mock-instance'

import {
  ILetterOfCredit,
  buildFakeLetterOfCredit,
  LetterOfCreditTaskType,
  IDataLetterOfCredit,
  TimerDurationUnit,
  TimerType
} from '@komgo/types'

import { ICompanyRegistryService } from '../../../service-layer/ICompanyRegistryService'
import CompanyRegistryService from '../../../service-layer/CompanyRegistryService'

import { ILetterOfCreditNotificationManager } from '../notifications/ILetterOfCreditNotificationManager'
import { LetterOfCreditNotificationManager } from '../notifications/LetterOfCreditNotificationManager'
import { ILetterOfCreditMessagingService } from '../messaging/ILetterOfCreditMessagingService'
import { LetterOfCreditMessagingService } from '../messaging/LetterOfCreditMessagingService'
import { ILetterOfCreditTaskManager } from '../tasks/ILetterOfCreditTaskManager'
import { LetterOfCreditTaskManager } from '../tasks/LetterOfCreditTaskManager'
import { ILetterOfCreditPartyActionProcessor } from './ILetterOfCreditPartyActionProcessor'
import { TRADE_FINANCE_ACTION } from '../../tasks/permissions'
import { LetterOfCreditPartyActionProcessorOnRequested } from './LetterOfCreditPartyActionProcessorOnRequested'
import { LetterOfCreditPartyActionProcessorHelper } from './LetterOfCreditPartyActionProcessorHelper'
import { ILetterOfCreditPartyActionProcessorHelper } from './ILetterOfCreditPartyActionProcessorHelper'
import { ILetterOfCreditTimerService, LetterOfCreditTimerService } from '../../timers/LetterOfCreditTimerService'

describe('LetterOfCreditPartyActionProcessorOnRequested', () => {
  const kapsuleBaseUrl = 'kapsuleUrl'

  let letterOfCreditPartyActionProcessorOnRequested: ILetterOfCreditPartyActionProcessor
  let letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>
  let mockLetterOfCreditTaskManager: jest.Mocked<ILetterOfCreditTaskManager>
  let mockLetterOfCreditNotificationManager: jest.Mocked<ILetterOfCreditNotificationManager>
  let mockCompanyRegistry: jest.Mocked<ICompanyRegistryService>
  let mockLetterOfCreditMessagingService: jest.Mocked<ILetterOfCreditMessagingService>
  let mockLetterOfCreditTimerService: jest.Mocked<ILetterOfCreditTimerService>
  let letterOfCreditPartyActionProcessorHelper: ILetterOfCreditPartyActionProcessorHelper

  beforeEach(() => {
    letterOfCredit = buildFakeLetterOfCredit()
    mockLetterOfCreditTaskManager = createMockInstance(LetterOfCreditTaskManager)
    mockCompanyRegistry = createMockInstance(CompanyRegistryService)
    mockLetterOfCreditNotificationManager = createMockInstance(LetterOfCreditNotificationManager)
    mockLetterOfCreditMessagingService = createMockInstance(LetterOfCreditMessagingService)
    mockLetterOfCreditTimerService = createMockInstance(LetterOfCreditTimerService)

    mockLetterOfCreditMessagingService.sendMessageTo.mockImplementation(() => {
      Promise.resolve('messageId')
    })
  })

  describe('executePartyActions', () => {
    it('should create send messages to parties WHEN party is APPLICANT', async () => {
      const { applicant, beneficiary, issuingBank } = letterOfCredit.templateInstance.data
      mockCompanyRegistry.getMembers.mockImplementation(() => {
        const members = [beneficiary, issuingBank]
        const membersAsMembers = members.map(item => {
          item.isMember = true
          return item
        })
        return Promise.resolve(membersAsMembers)
      })

      const applicantStaticId = applicant.staticId

      letterOfCreditPartyActionProcessorHelper = new LetterOfCreditPartyActionProcessorHelper(applicantStaticId)

      letterOfCreditPartyActionProcessorOnRequested = new LetterOfCreditPartyActionProcessorOnRequested(
        mockCompanyRegistry,
        applicantStaticId,
        mockLetterOfCreditTaskManager,
        mockLetterOfCreditNotificationManager,
        mockLetterOfCreditMessagingService,
        letterOfCreditPartyActionProcessorHelper,
        mockLetterOfCreditTimerService,
        kapsuleBaseUrl
      )

      letterOfCredit.templateInstance.data.issueDueDate = {
        duration: 2,
        unit: TimerDurationUnit.Weeks,
        timerType: TimerType.CalendarDays
      }

      await letterOfCreditPartyActionProcessorOnRequested.executePartyActions(letterOfCredit)

      expect(mockLetterOfCreditMessagingService.sendMessageTo).toHaveBeenCalledTimes(2)
      expect(mockLetterOfCreditMessagingService.sendMessageTo).toHaveBeenNthCalledWith(
        1,
        beneficiary.staticId,
        letterOfCredit
      )
      expect(mockLetterOfCreditMessagingService.sendMessageTo).toHaveBeenNthCalledWith(
        2,
        issuingBank.staticId,
        letterOfCredit
      )

      expect(mockLetterOfCreditTimerService.issuanceTimer).toHaveBeenCalledWith(letterOfCredit)
    })

    it('should create a notification to review WHEN party is BENEFICIARY', async () => {
      const { applicant, beneficiary } = letterOfCredit.templateInstance.data
      const applicantName = applicant.x500Name.CN

      const beneficiaryStaticId = beneficiary.staticId

      letterOfCreditPartyActionProcessorHelper = new LetterOfCreditPartyActionProcessorHelper(beneficiaryStaticId)

      letterOfCreditPartyActionProcessorOnRequested = new LetterOfCreditPartyActionProcessorOnRequested(
        mockCompanyRegistry,
        beneficiaryStaticId,
        mockLetterOfCreditTaskManager,
        mockLetterOfCreditNotificationManager,
        mockLetterOfCreditMessagingService,
        letterOfCreditPartyActionProcessorHelper,
        mockLetterOfCreditTimerService,
        kapsuleBaseUrl
      )

      await letterOfCreditPartyActionProcessorOnRequested.executePartyActions(letterOfCredit)

      expect(mockLetterOfCreditNotificationManager.createNotification).toHaveBeenCalledTimes(1)
      expect(mockLetterOfCreditNotificationManager.createNotification).toHaveBeenCalledWith(
        letterOfCredit,
        `Letter of credit [${letterOfCredit.reference}] has been requested by ${applicantName}`,
        {},
        LetterOfCreditTaskType.ReviewRequested,
        TRADE_FINANCE_ACTION.ReviewLCApplication
      )
    })

    it('should create a task to review WHEN party is ISSUINGBANK', async () => {
      const { applicant, issuingBank } = letterOfCredit.templateInstance.data
      const applicantName = applicant.x500Name.CN

      const issuingBankStaticId = issuingBank.staticId

      letterOfCreditPartyActionProcessorHelper = new LetterOfCreditPartyActionProcessorHelper(issuingBankStaticId)

      letterOfCreditPartyActionProcessorOnRequested = new LetterOfCreditPartyActionProcessorOnRequested(
        mockCompanyRegistry,
        issuingBankStaticId,
        mockLetterOfCreditTaskManager,
        mockLetterOfCreditNotificationManager,
        mockLetterOfCreditMessagingService,
        letterOfCreditPartyActionProcessorHelper,
        mockLetterOfCreditTimerService,
        kapsuleBaseUrl
      )

      letterOfCredit.templateInstance.data.issueDueDate = {
        duration: 2,
        unit: TimerDurationUnit.Weeks,
        timerType: TimerType.CalendarDays
      }

      await letterOfCreditPartyActionProcessorOnRequested.executePartyActions(letterOfCredit)

      expect(mockLetterOfCreditTaskManager.createTask).toHaveBeenCalledTimes(1)
      expect(mockLetterOfCreditTaskManager.createTask).toHaveBeenCalledWith(
        letterOfCredit,
        `Letter of credit [${letterOfCredit.reference}] has been requested by ${applicantName}`,
        LetterOfCreditTaskType.ReviewRequested,
        TRADE_FINANCE_ACTION.ReviewLCApplication,
        {
          subject: 'Letter of credit Requested',
          emailTaskTitle: 'Review Letter of credit Request',
          emailTaskLink: `${kapsuleBaseUrl}/tasks`
        }
      )
      expect(mockLetterOfCreditTimerService.issuanceTimer).toHaveBeenCalledWith(letterOfCredit)
    })
  })
})
