import 'reflect-metadata'

import { NotificationLevel } from '@komgo/notification-publisher'
import { TRADE_FINANCE_ACTION, TRADE_FINANCE_PRODUCT_ID } from '../tasks/permissions'
import { LetterOfCreditTimerService, ILetterOfCreditTimerService } from './LetterOfCreditTimerService'
import {
  TimerDurationUnit,
  TimerType,
  buildFakeLetterOfCredit,
  ILetterOfCredit,
  IDataLetterOfCredit,
  CompanyRoles,
  LetterOfCreditTaskType
} from '@komgo/types'

let timerService = {
  createTimer: jest.fn().mockResolvedValue({ staticId: 'timer-static-id' }),
  fetchTimer: jest.fn(),
  deactivateTimer: jest.fn()
}
let partyActionHelper = {
  getPartyAction: jest.fn(),
  getPartyRole: jest.fn(),
  getLetterOfCreditType: jest.fn()
}
let letterOfCreditTimerService: ILetterOfCreditTimerService // LetterOfCreditTimerService
let dataAgent
let letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>
let notificationManager

describe('LetterOfCreditTimerService', () => {
  beforeEach(() => {
    letterOfCredit = buildFakeLetterOfCredit()
    timerService = {
      createTimer: jest.fn().mockResolvedValue({ staticId: 'create-timer-static-id' }),
      fetchTimer: jest.fn(),
      deactivateTimer: jest.fn()
    }
    partyActionHelper = {
      getPartyAction: jest.fn(),
      getPartyRole: jest.fn(),
      getLetterOfCreditType: jest.fn()
    }
    dataAgent = {
      update: jest.fn()
    }
    notificationManager = {
      buildNotification: jest.fn()
    }
    letterOfCreditTimerService = new LetterOfCreditTimerService(
      dataAgent,
      timerService,
      partyActionHelper,
      notificationManager
    )
  })

  it('issue timer - applicant', async () => {
    letterOfCredit.templateInstance.data.issueDueDate = {
      duration: 2,
      unit: TimerDurationUnit.Weeks,
      timerType: TimerType.CalendarDays
    }
    partyActionHelper.getLetterOfCreditType = jest.fn().mockReturnValue('SBLC')
    partyActionHelper.getPartyRole = jest.fn().mockReturnValue(CompanyRoles.Applicant)

    const { applicant } = letterOfCredit.templateInstance.data
    const applicantName = applicant.x500Name.CN

    const halfWayNotification = {
      context: {
        type: 'ILetterOfCredit',
        staticId: letterOfCredit.staticId
      },
      productId: 'tradeFinance',
      requiredPermission: {
        actionId: TRADE_FINANCE_ACTION.ManageLCRequest,
        productId: 'tradeFinance'
      },
      type: LetterOfCreditTaskType.ReviewRequested,
      message: `SBLC [${letterOfCredit.reference}] issuance requested by ${applicantName} has reached its halfway`,
      level: NotificationLevel.info
    }
    const expiryNotification = {
      context: {
        type: 'ILetterOfCredit',
        staticId: letterOfCredit.staticId
      },
      productId: 'tradeFinance',
      requiredPermission: {
        actionId: TRADE_FINANCE_ACTION.ManageLCRequest,
        productId: 'tradeFinance'
      },
      type: LetterOfCreditTaskType.ReviewRequested,
      message: `SBLC [${letterOfCredit.reference}] timer has expired`,
      level: NotificationLevel.info
    }

    notificationManager.buildNotification = jest
      .fn()
      .mockReturnValueOnce(halfWayNotification)
      .mockReturnValue(expiryNotification)
    await letterOfCreditTimerService.issuanceTimer(letterOfCredit)

    expect(notificationManager.buildNotification).toHaveBeenCalledWith(
      letterOfCredit,
      `SBLC [${letterOfCredit.reference}] timer has expired`,
      {},
      LetterOfCreditTaskType.ReviewRequested,
      TRADE_FINANCE_ACTION.ManageLCRequest,
      NotificationLevel.info
    )
    expect(notificationManager.buildNotification).toHaveBeenCalledWith(
      letterOfCredit,
      `SBLC [${letterOfCredit.reference}] issuance requested by ${applicantName} has reached its halfway`,
      {},
      LetterOfCreditTaskType.ReviewRequested,
      TRADE_FINANCE_ACTION.ManageLCRequest,
      NotificationLevel.info
    )

    expect(timerService.createTimer).toHaveBeenCalledWith(
      letterOfCredit.templateInstance.data.issueDueDate,
      [
        {
          notification: halfWayNotification,
          factor: 2
        },
        {
          notification: expiryNotification,
          factor: 1
        }
      ],
      {
        staticId: letterOfCredit.staticId,
        productId: TRADE_FINANCE_PRODUCT_ID,
        subProductId: 'letterOfCredit'
      }
    )

    const mockLetterOfCredit = dataAgent.update.mock.calls[0][1]

    expect(mockLetterOfCredit.templateInstance.data.issueDueDate).toMatchObject({
      duration: 2,
      staticId: 'create-timer-static-id',
      unit: TimerDurationUnit.Weeks,
      timerType: TimerType.CalendarDays
    })
  })

  it('issue timer - Beneficiary', async () => {
    letterOfCredit.templateInstance.data.issueDueDate = {
      duration: 2,
      unit: TimerDurationUnit.Weeks,
      timerType: TimerType.CalendarDays
    }
    partyActionHelper.getLetterOfCreditType = jest.fn().mockReturnValue('SBLC')
    partyActionHelper.getPartyRole = jest.fn().mockReturnValue(CompanyRoles.Beneficiary)

    const { applicant } = letterOfCredit.templateInstance.data
    const applicantName = applicant.x500Name.CN

    const halfWayNotification = {
      context: {
        type: 'ILetterOfCredit',
        staticId: letterOfCredit.staticId
      },
      productId: 'tradeFinance',
      requiredPermission: {
        actionId: TRADE_FINANCE_ACTION.ReviewIssuedLC,
        productId: 'tradeFinance'
      },
      type: LetterOfCreditTaskType.ReviewIssued,
      message: `SBLC [${letterOfCredit.reference}] issuance requested by ${applicantName} has reached its halfway`,
      level: NotificationLevel.danger
    }
    const expiryNotification = {
      context: {
        type: 'ILetterOfCredit',
        staticId: letterOfCredit.staticId
      },
      productId: 'tradeFinance',
      requiredPermission: {
        actionId: TRADE_FINANCE_ACTION.ReviewIssuedLC,
        productId: 'tradeFinance'
      },
      type: LetterOfCreditTaskType.ReviewIssued,
      message: `SBLC [${letterOfCredit.reference}] timer has expired`,
      level: NotificationLevel.info
    }

    notificationManager.buildNotification = jest
      .fn()
      .mockReturnValueOnce(halfWayNotification)
      .mockReturnValue(expiryNotification)
    await letterOfCreditTimerService.issuanceTimer(letterOfCredit)

    expect(timerService.createTimer).toHaveBeenCalledWith(
      letterOfCredit.templateInstance.data.issueDueDate,
      [
        {
          notification: halfWayNotification,
          factor: 2
        },
        {
          notification: expiryNotification,
          factor: 1
        }
      ],
      {
        staticId: letterOfCredit.staticId,
        productId: TRADE_FINANCE_PRODUCT_ID,
        subProductId: 'letterOfCredit'
      }
    )

    expect(notificationManager.buildNotification).toHaveBeenCalledWith(
      letterOfCredit,
      `SBLC [${letterOfCredit.reference}] issuance requested by ${applicantName} has reached its halfway`,
      {},
      LetterOfCreditTaskType.ReviewIssued,
      TRADE_FINANCE_ACTION.ReviewIssuedLC,
      NotificationLevel.danger
    )
    expect(notificationManager.buildNotification).toHaveBeenCalledWith(
      letterOfCredit,
      `SBLC [${letterOfCredit.reference}] timer has expired`,
      {},
      LetterOfCreditTaskType.ReviewIssued,
      TRADE_FINANCE_ACTION.ReviewIssuedLC,
      NotificationLevel.info
    )

    const mockLetterOfCredit = dataAgent.update.mock.calls[0][1]

    expect(mockLetterOfCredit.templateInstance.data.issueDueDate).toMatchObject({
      duration: 2,
      staticId: 'create-timer-static-id',
      unit: TimerDurationUnit.Weeks,
      timerType: TimerType.CalendarDays
    })
  })

  it('issue timer - IssuingBank', async () => {
    letterOfCredit.templateInstance.data.issueDueDate = {
      duration: 2,
      unit: TimerDurationUnit.Weeks,
      timerType: TimerType.CalendarDays
    }
    partyActionHelper.getLetterOfCreditType = jest.fn().mockReturnValue('SBLC')
    partyActionHelper.getPartyRole = jest.fn().mockReturnValue(CompanyRoles.IssuingBank)

    const { applicant } = letterOfCredit.templateInstance.data
    const applicantName = applicant.x500Name.CN

    const halfWayNotification = {
      context: {
        type: 'ILetterOfCredit',
        staticId: letterOfCredit.staticId
      },
      productId: 'tradeFinance',
      requiredPermission: {
        actionId: TRADE_FINANCE_ACTION.ReviewLCApplication,
        productId: 'tradeFinance'
      },
      type: LetterOfCreditTaskType.ReviewRequested,
      message: `SBLC [${letterOfCredit.reference}] issuance requested by ${applicantName} has reached its halfway`,
      level: NotificationLevel.danger
    }
    const expiryNotification = {
      context: {
        type: 'ILetterOfCredit',
        staticId: letterOfCredit.staticId
      },
      productId: 'tradeFinance',
      requiredPermission: {
        actionId: TRADE_FINANCE_ACTION.ReviewLCApplication,
        productId: 'tradeFinance'
      },
      type: LetterOfCreditTaskType.ReviewRequested,
      message: `SBLC [${letterOfCredit.reference}] timer has expired`,
      level: NotificationLevel.info
    }

    notificationManager.buildNotification = jest
      .fn()
      .mockReturnValueOnce(halfWayNotification)
      .mockReturnValue(expiryNotification)
    await letterOfCreditTimerService.issuanceTimer(letterOfCredit)

    expect(timerService.createTimer).toHaveBeenCalledWith(
      letterOfCredit.templateInstance.data.issueDueDate,
      [
        {
          notification: halfWayNotification,
          factor: 2
        },
        {
          notification: expiryNotification,
          factor: 1
        }
      ],
      {
        staticId: letterOfCredit.staticId,
        productId: TRADE_FINANCE_PRODUCT_ID,
        subProductId: 'letterOfCredit'
      }
    )
    expect(notificationManager.buildNotification).toHaveBeenCalledWith(
      letterOfCredit,
      `SBLC [${letterOfCredit.reference}] issuance requested by ${applicantName} has reached its halfway`,
      {},
      LetterOfCreditTaskType.ReviewRequested,
      TRADE_FINANCE_ACTION.ReviewLCApplication,
      NotificationLevel.danger
    )
    expect(notificationManager.buildNotification).toHaveBeenCalledWith(
      letterOfCredit,
      `SBLC [${letterOfCredit.reference}] timer has expired`,
      {},
      LetterOfCreditTaskType.ReviewRequested,
      TRADE_FINANCE_ACTION.ReviewLCApplication,
      NotificationLevel.info
    )

    const mockLetterOfCredit = dataAgent.update.mock.calls[0][1]

    expect(mockLetterOfCredit.templateInstance.data.issueDueDate).toMatchObject({
      duration: 2,
      staticId: 'create-timer-static-id',
      unit: TimerDurationUnit.Weeks,
      timerType: TimerType.CalendarDays
    })
  })
})
