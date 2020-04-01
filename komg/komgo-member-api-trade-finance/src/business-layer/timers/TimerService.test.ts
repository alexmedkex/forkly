import 'reflect-metadata'
import createMockInstance from 'jest-create-mock-instance'

import { TimerServiceClient } from './TimerServiceClient'
import { NotificationLevel } from '@komgo/notification-publisher'
import { TRADE_FINANCE_ACTION } from '../tasks/permissions'
import { ITimerService, TimerService } from './TimerService'
import { TimerDurationUnit, TimerType, TimerJobType } from '@komgo/types'
import { TIMER_PRODUCT, TIMER_SUB_PRODUCT } from './timerTypes'

let timerClientService = createMockInstance(TimerServiceClient)

let timerService: ITimerService

const sampleID = 'sample_id'
const sampleReference = 'sample_LC_reference'
const sampleTimerBase = {
  duration: 1,
  unit: TimerDurationUnit.Weeks,
  timerType: TimerType.CalendarDays
}
const sampleNotification = [
  {
    notification: {
      context: {
        lcid: sampleID
      },
      productId: 'tradeFinance',
      requiredPermission: {
        actionId: TRADE_FINANCE_ACTION.ReviewLCApplication,
        productId: 'tradeFinance'
      },
      type: 'LC.info',
      message: `LC ${sampleReference} timer has expired`,
      level: NotificationLevel.info
    },
    factor: 1
  }
]
const sampleContext = {
  lcId: sampleID,
  productId: TIMER_PRODUCT.TradeFinance,
  subProductId: TIMER_SUB_PRODUCT.LC
}

describe('TimerService', () => {
  beforeEach(() => {
    timerClientService = createMockInstance(TimerServiceClient)
    timerClientService.saveTimer.mockResolvedValue({ staticId: 'timer-static-id' })
    timerService = new TimerService(timerClientService)
  })

  it('createTimer timer', async () => {
    await timerService.createTimer(sampleTimerBase, sampleNotification, sampleContext)
    const timerRequest = {
      timerType: TimerType.CalendarDays,
      duration: {
        duration: 1,
        unit: TimerDurationUnit.Weeks
      },
      timerData: [
        {
          payload: {
            notification: sampleNotification[0].notification,
            jobType: TimerJobType.sendNotification
          }
        }
      ],
      context: {
        lcId: sampleID,
        productId: TIMER_PRODUCT.TradeFinance,
        subProductId: TIMER_SUB_PRODUCT.LC
      }
    }
    expect(timerClientService.saveTimer.mock.calls[0][0]).toMatchObject(timerRequest)
  })

  it('fetch timer', async () => {
    const fetchTimerResponse = {
      submissionDateTime: new Date('2019-01-01'),
      status: 'inProgress',
      timerData: [
        {
          status: 'completed',
          retry: 0,
          timerId: '1898f14f-4871-40c1-941a-24386d843b20',
          time: new Date('2019-01-01')
        },
        {
          status: 'pending',
          retry: 0,
          timerId: 'a5fdcad6-ea65-4431-bbd5-c046a0ff17b5',
          time: new Date('2019-01-02')
        }
      ]
    }

    timerClientService.fetchTimer.mockResolvedValue(fetchTimerResponse)
    const result = await timerService.fetchTimer('timer-static-id')
    expect(timerClientService.fetchTimer).toHaveBeenCalledWith('timer-static-id')
    expect(result).toMatchObject({
      staticId: 'timer-static-id',
      time: new Date('2019-01-02'),
      status: 'inProgress'
    })
  })
})
