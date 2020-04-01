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

import { ITimerJobProcessorBase } from './ITimerJobProcessor'
import { TIMER_JOB_TYPE } from './TimerJobType'
import { ITimerScheduleProcessor, TimerScheduleProcessor } from './TimerScheduleProcessor'

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
let scheduleProcessor: ITimerScheduleProcessor
let mockJobProcessor: ITimerJobProcessorBase

const getJobName = (staticId, timerId) => {
  return `${staticId}-timerId-${timerId}`
}

describe('TimerScheduleProcessor', () => {
  beforeEach(() => {
    mockJobProcessor = {
      timerJobType: TIMER_JOB_TYPE.SendNotification,
      executeJob: jest.fn().mockResolvedValue(true)
    }
    mockTimerDataAgent = createMockInstance(TimerDataAgent)
    scheduleProcessor = new TimerScheduleProcessor(mockTimerDataAgent, 5, 1, [mockJobProcessor])
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
        }
      ]
    }
    mockTimerDataAgent.get = jest.fn().mockResolvedValue(timer)
    await scheduleProcessor.scheduleJob(timer, timer.timerData[0])
    await waitForExpect(async () => {
      const jobName = getJobName(timer.staticId, timer.timerData[0].timerId)
      expect(schedule.scheduledJobs.hasOwnProperty(jobName)).toBeTruthy()
      await schedule.cancelJob(jobName)
    })
  })

  it('add and execute timer', async () => {
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
          timerId: uuid4()
        }
      ]
    }
    mockTimerDataAgent.get = jest.fn().mockResolvedValue(timer)
    await scheduleProcessor.scheduleJob(timer, timer.timerData[0])
    await waitForExpect(
      async () => {
        const jobName = getJobName(timer.staticId, timer.timerData[0].timerId)
        expect(mockTimerDataAgent.get).toBeCalledWith(timer.staticId)
        expect(schedule.scheduledJobs.hasOwnProperty(jobName)).toBeTruthy()
        expect(mockTimerDataAgent.updateField).toBeCalledWith(timer.staticId, expect.anything(), expect.anything())
        expect(mockTimerDataAgent.updateStatus).toBeCalledWith(timer.staticId, TimerStatus.Completed)
      },
      8000,
      1000
    )
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

    await scheduleProcessor.scheduleJob(timer, timer.timerData[0])
    const jobName = getJobName(timer.staticId, timer.timerData[0].timerId)
    await waitForExpect(async () => {
      expect(schedule.scheduledJobs.hasOwnProperty(jobName)).toBeTruthy()
    })
    await scheduleProcessor.stopTimerJob(timer, timer.timerData[0], TimerDataStatus.Cancelled)
    await waitForExpect(async () => {
      expect(schedule.scheduledJobs.hasOwnProperty(jobName)).toBeFalsy()
    })
  })

  it('cleanup timer jobs', async () => {
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

    await scheduleProcessor.scheduleJob(timer, timer.timerData[0])
    const jobName = getJobName(timer.staticId, timer.timerData[0].timerId)
    await waitForExpect(async () => {
      expect(schedule.scheduledJobs.hasOwnProperty(jobName)).toBeTruthy()
    })
    await scheduleProcessor.cleanUpTimerJobs(timer.staticId)
    await waitForExpect(async () => {
      expect(schedule.scheduledJobs.hasOwnProperty(jobName)).toBeFalsy()
    })
  })
})
