import createMockInstance from 'jest-create-mock-instance'
import * as moment from 'moment'
import * as schedule from 'node-schedule'
import 'reflect-metadata'
import { v4 as uuid4 } from 'uuid'

import { ITimerDataAgent } from '../../data-layer/data-agents/ITimerDataAgent'
import TimerDataAgent from '../../data-layer/data-agents/TimerDataAgent'
import { DurationUnit } from '../../data-layer/models/DurationUnit'
import { ITimer } from '../../data-layer/models/ITimer'
import { TimerDataStatus } from '../../data-layer/models/TimerDataStatus'
import { TimerStatus } from '../../data-layer/models/TimerStatus'
import { TimerType } from '../../data-layer/models/TimerType'

import { TIMER_JOB_TYPE } from './TimerJobType'
import { ITimerScheduleProcessor, TimerScheduleProcessor } from './TimerScheduleProcessor'
import { TimerScheduleService, ITimerScheduleService } from './TimerScheduleService'

jest.setTimeout(10000)

const waitForExpect = require('wait-for-expect')

const mockTimer: ITimer = {
  staticId: '1234',
  status: TimerStatus.InProgress,
  timerType: TimerType.CalendarDays,
  submissionDateTime: new Date(),
  duration: {
    unit: DurationUnit.Minutes,
    duration: 1
  },
  timerData: [
    {
      status: TimerDataStatus.Pending,
      retry: 0,
      time: moment()
        .add(10, 'seconds')
        .toDate(),
      timerId: 'b21af173-643c-4096-a64b-be4902c9fa5f'
    }
  ],
  context: {
    lcId: '1234'
  }
}

let mockTimerDataAgent: ITimerDataAgent
let scheduleService: ITimerScheduleService
let mockTimerProcessor: ITimerScheduleProcessor

const getJobName = (staticId, timerId) => {
  return `${staticId}-timerId-${timerId}`
}

describe('TimerScheduleService', () => {
  beforeEach(() => {
    mockTimerProcessor = {
      scheduleJob: jest.fn().mockResolvedValue(true),
      stopTimerJob: jest.fn(),
      cleanUpTimerJobs: jest.fn()
    }
    mockTimerDataAgent = createMockInstance(TimerDataAgent)
    scheduleService = new TimerScheduleService(mockTimerDataAgent, mockTimerProcessor)
  })

  it('Start timers', async () => {
    const timer = {
      ...mockTimer,
      staticId: uuid4(),
      timerData: [
        {
          status: TimerDataStatus.Pending,
          retry: 0,
          time: moment()
            .add(2, 'seconds')
            .toDate(),
          timerId: uuid4(),
          payload: {
            jobType: TIMER_JOB_TYPE.SendNotification,
            notification: {}
          }
        }
      ]
    }

    mockTimerDataAgent.find = jest.fn().mockResolvedValue([timer])
    mockTimerDataAgent.get = jest.fn().mockResolvedValue(timer)
    await scheduleService.start()
    expect(mockTimerProcessor.scheduleJob).toBeCalledWith(timer, timer.timerData[0])
  })

  it('add timer job', async () => {
    const timer = {
      ...mockTimer,
      staticId: uuid4(),
      timerData: [
        {
          status: TimerDataStatus.Pending,
          retry: 0,
          time: moment()
            .add(10, 'minutes')
            .toDate(),
          timerId: uuid4()
        },
        {
          status: TimerDataStatus.Failed,
          retry: 0,
          time: moment()
            .add(10, 'minutes')
            .toDate(),
          timerId: uuid4()
        }
      ]
    }
    mockTimerDataAgent.get = jest.fn().mockResolvedValue(timer)
    await scheduleService.scheduleJobs(timer.staticId)

    expect(mockTimerDataAgent.get).toBeCalledWith(timer.staticId)
    expect(mockTimerProcessor.scheduleJob).toBeCalledWith(timer, timer.timerData[0])
    expect(mockTimerProcessor.scheduleJob).not.toBeCalledWith(timer, timer.timerData[1])
  })

  it('cancel timer job', async () => {
    const timer = {
      ...mockTimer,
      timerData: [
        {
          status: TimerDataStatus.Pending,
          retry: 0,
          time: moment()
            .add(10, 'minutes')
            .toDate(),
          timerId: 'b21af173-643c-4096-a64b-be4902c9fa5f'
        }
      ]
    }
    mockTimerDataAgent.get = jest.fn().mockResolvedValue(timer)
    await scheduleService.stopTimer(timer.staticId, TimerStatus.Cancelled)
    expect(mockTimerProcessor.stopTimerJob).toBeCalledWith(timer, timer.timerData[0], TimerDataStatus.Cancelled)
    expect(mockTimerProcessor.cleanUpTimerJobs).toBeCalledWith(timer.staticId)
    expect(mockTimerDataAgent.updateStatus).toBeCalledWith(timer.staticId, TimerStatus.Cancelled)

    await scheduleService.stopTimer(timer.staticId, TimerStatus.Closed)
    expect(mockTimerProcessor.stopTimerJob).toBeCalledWith(timer, timer.timerData[0], TimerDataStatus.Closed)

    await scheduleService.stopTimer(timer.staticId, TimerStatus.Completed)
    expect(mockTimerProcessor.stopTimerJob).toBeCalledWith(timer, timer.timerData[0], TimerDataStatus.Completed)
  })
})
