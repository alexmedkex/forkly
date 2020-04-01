import 'reflect-metadata'

import { ITimerServiceClient } from './ITimerServiceClient'
import { LCTimerService } from './LCTimerService'
import { TimerRequestBuilder } from './TimerRequestBuilder'
import { ILC } from '../../data-layer/models/ILC'
import { ILCCacheDataAgent } from '../../data-layer/data-agents'
import { COMPANY_LC_ROLE } from '../CompanyRole'
import { NotificationLevel } from '@komgo/notification-publisher'
import { TRADE_FINANCE_ACTION } from '../tasks/permissions'
import { ICompanyRegistryService } from '../../service-layer/ICompanyRegistryService'
import { ITimerService } from './TimerService'
import { TimerDurationUnit, TimerType } from '@komgo/types'
import { TIMER_PRODUCT, TIMER_SUB_PRODUCT } from './timerTypes'

let timerService = {
  createTimer: jest.fn().mockResolvedValue({ staticId: 'timer-static-id' }),
  deactivateTimer: jest.fn(),
  fetchTimer: jest.fn()
}

const companyServiceMock: ICompanyRegistryService = {
  getMember: jest.fn(),
  getNodeKeys: jest.fn(),
  getMembersByNode: jest.fn(),
  getMembers: jest.fn()
}

let lcTimerService: LCTimerService
const sampleLC: ILC = {
  _id: 'sampleLCId',
  applicantId: 'applicantId',
  beneficiaryId: 'beneficiaryId',
  issuingBankId: 'issuingBankId',
  beneficiaryBankId: 'beneficiaryBankId',
  reference: 'sampleLCreference',
  type: 'IRREVOCABLE',
  direct: false,
  billOfLadingEndorsement: 'APPLICANT',
  currency: 'USD',
  amount: 2.1,
  expiryDate: '2018-12-22',
  feesPayableBy: 'SPLIT',
  applicableRules: 'UCP_LATEST_VERSION',
  cargoIds: [],
  expiryPlace: 'London',
  availableWith: 'ADVISING_BANK',
  availableBy: 'ACCEPTANCE',
  documentPresentationDeadlineDays: 21,
  template: 'free text template',
  partialShipmentAllowed: false,
  transhipmentAllowed: false,
  comments: 'a comment',
  freeText: '',
  issueDueDate: {
    unit: TimerDurationUnit.Weeks,
    duration: 1
  }
}

let lcDataAgent: ILCCacheDataAgent

describe('LCTimerService', () => {
  beforeEach(() => {
    timerService = {
      createTimer: jest.fn().mockResolvedValue({ staticId: 'timer-static-id' }),
      deactivateTimer: jest.fn(),
      fetchTimer: jest.fn()
    }

    lcDataAgent = {
      saveLC: jest.fn(),
      updateLcByReference: jest.fn(),
      updateField: jest.fn(),
      updateStatus: jest.fn(),
      getLC: jest.fn(),
      getLCs: jest.fn(),
      getNonce: jest.fn(),
      count: jest.fn()
    }
    lcTimerService = new LCTimerService(lcDataAgent, timerService, new TimerRequestBuilder(), companyServiceMock)
  })

  it('save timer - application bank', async () => {
    await lcTimerService.lcIssuanceTimer(sampleLC, COMPANY_LC_ROLE.Applicant)

    expect(timerService.createTimer).toHaveBeenCalledWith(
      {
        duration: 1,
        unit: TimerDurationUnit.Weeks,
        timerType: TimerType.CalendarDays
      },
      [
        {
          notification: {
            context: {
              lcid: sampleLC._id
            },
            productId: 'tradeFinance',
            requiredPermission: {
              actionId: TRADE_FINANCE_ACTION.ManageLCRequest,
              productId: 'tradeFinance'
            },
            type: 'LC.info',
            message: `LC ${sampleLC.reference} Issuance Request from  has reached its halfway`,
            level: NotificationLevel.info
          },
          factor: 2
        },
        {
          notification: {
            context: {
              lcid: sampleLC._id
            },
            productId: 'tradeFinance',
            requiredPermission: {
              actionId: TRADE_FINANCE_ACTION.ManageLCRequest,
              productId: 'tradeFinance'
            },
            type: 'LC.info',
            message: `LC ${sampleLC.reference} timer has expired`,
            level: NotificationLevel.info
          },
          factor: 1
        }
      ],
      {
        lcId: sampleLC._id,
        productId: TIMER_PRODUCT.TradeFinance,
        subProductId: TIMER_SUB_PRODUCT.LC
      }
    )

    expect(lcDataAgent.updateField).toHaveBeenCalledWith(sampleLC._id, 'issueDueDate', {
      unit: TimerDurationUnit.Weeks,
      duration: 1,
      timerType: TimerType.CalendarDays,
      timerStaticId: 'timer-static-id'
    })
  })

  it('save timer - issuing bank', async () => {
    await lcTimerService.lcIssuanceTimer(sampleLC, COMPANY_LC_ROLE.IssuingBank)
    expect(timerService.createTimer).toHaveBeenCalledWith(
      {
        duration: 1,
        unit: TimerDurationUnit.Weeks,
        timerType: TimerType.CalendarDays
      },
      [
        {
          notification: {
            context: {
              lcid: sampleLC._id
            },
            productId: 'tradeFinance',
            requiredPermission: {
              actionId: TRADE_FINANCE_ACTION.ReviewLCApplication,
              productId: 'tradeFinance'
            },
            type: 'LC.info',
            message: `LC ${sampleLC.reference} Issuance Request from  has reached its halfway`,
            level: NotificationLevel.danger
          },
          factor: 2
        },
        {
          notification: {
            context: {
              lcid: sampleLC._id
            },
            productId: 'tradeFinance',
            requiredPermission: {
              actionId: TRADE_FINANCE_ACTION.ReviewLCApplication,
              productId: 'tradeFinance'
            },
            type: 'LC.info',
            message: `LC ${sampleLC.reference} timer has expired`,
            level: NotificationLevel.info
          },
          factor: 1
        }
      ],
      {
        lcId: sampleLC._id,
        productId: TIMER_PRODUCT.TradeFinance,
        subProductId: TIMER_SUB_PRODUCT.LC
      }
    )

    expect(lcDataAgent.updateField).toHaveBeenCalledWith(sampleLC._id, 'issueDueDate', {
      unit: TimerDurationUnit.Weeks,
      duration: 1,
      timerType: TimerType.CalendarDays,
      timerStaticId: 'timer-static-id'
    })
  })

  it('failes', async () => {
    const lcWithoutTimer = {
      ...sampleLC,
      issueDueDate: null
    }
    await expect(lcTimerService.lcIssuanceTimer(lcWithoutTimer, COMPANY_LC_ROLE.Applicant)).rejects.toEqual(
      new Error('Issue due date not set')
    )
  })
})
