import 'reflect-metadata'
import { axiosMock, postAPI, getAPI, putAPI, deleteAPI } from './utils/axios-utils'

import moment = require('moment');
import { TIMER_JOB_TYPE } from '../src/business-layer/schedule/TimerJobType';
import { ITimerDataAgent } from '../src/data-layer/data-agents/ITimerDataAgent'
import { DurationUnit } from '../src/data-layer/models/DurationUnit'
import { TimerStatus } from '../src/data-layer/models/TimerStatus'
import { TYPES } from '../src/inversify/types'
import { ICreateTimerRequest } from '../src/service-layer/requests/timer/ICreateTimerRequest'
import * as schedule from 'node-schedule'
import { runServer, stopServer } from './utils/run-server'

import { apiroutes } from './utils/apiroutes'
import { IntegrationEnvironment } from './utils/environment'
import { IGetTimerResponse } from '../src/service-layer/responses/timer/IGetTimerResponse';
import { ITimerScheduleService } from '../src/business-layer/schedule/TimerScheduleService';

const waitForExpect = require('wait-for-expect')

let timerDataAgent: ITimerDataAgent
const integrationEnvironment: IntegrationEnvironment = new IntegrationEnvironment()
let scheduleServer: ITimerScheduleService
jest.setTimeout(500000)

const timerRequest: ICreateTimerRequest = {
  duration: {
    duration: 1,
    unit: DurationUnit.Weeks
  },
  timerData: [{
    time: moment().add(5, 'minutes').toDate(),
    payload: {
      jobType: TIMER_JOB_TYPE.SendNotification,
      notification: { productId: 'timer' }
    }
  }],
  context: {
    lcId: '1234'
  }
}

describe('Schedule timer', () => {
  beforeAll(async () => {
    await integrationEnvironment.start()
    timerDataAgent = integrationEnvironment.container.get<ITimerDataAgent>(TYPES.TimerDataAgent)
    scheduleServer = integrationEnvironment.container.get<ITimerScheduleService>(TYPES.TimerScheduleService)
  })
  afterAll(async () => {
    await integrationEnvironment.stop(axiosMock)
  })
  beforeEach(async () => {
    axiosMock.reset()
    axiosMock.onAny(apiroutes.notification.create)
      .reply(200)
      .onAny(apiroutes.notification.task)
      .reply(200)
  })
  it('Should scheduled timer after service is restarted', async () => {
    const result = await postAPI(`timers`, {
      ...timerRequest,
      timerData: [{
        time: moment().add(15, 'seconds').toDate(),
        payload: {
          jobType: TIMER_JOB_TYPE.SendNotification,
          notification: { productId: 'timer' }
        }
      }]
    })

    const timer = await getAPI<IGetTimerResponse>(`timers/${result.data.staticId}`)

    expect(result).toBeDefined()

    await schedule.cancelJob(`${timer.data.staticId}-timerId-${timer.data.timerData[0].timerId}`)

    await scheduleServer.start()

    await waitForExpect(async () => {
      const timer = await getAPI<any>(`timers/${result.data.staticId}`)
      expect(timer.data.status).toEqual(TimerStatus.Completed)
    }, 20000)
  })
})