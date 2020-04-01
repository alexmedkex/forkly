import moment = require('moment');
import 'reflect-metadata'
import { v4 as uuid4 } from 'uuid'
// tslint:disable-next-line:ordered-imports
import { axiosMock, postAPI, getAPI, putAPI, deleteAPI } from './utils/axios-utils'

import { TIMER_JOB_TYPE } from '../src/business-layer/schedule/TimerJobType';
import { ITimerDataAgent } from '../src/data-layer/data-agents/ITimerDataAgent'
import { DurationUnit } from '../src/data-layer/models/DurationUnit'
import { TimerStatus } from '../src/data-layer/models/TimerStatus'
import { TYPES } from '../src/inversify/types'
import { ICreateTimerRequest } from '../src/service-layer/requests/timer/ICreateTimerRequest'

import { apiroutes } from './utils/apiroutes'
import { IntegrationEnvironment } from './utils/environment'

const waitForExpect = require('wait-for-expect')

let timerDataAgent: ITimerDataAgent
const integrationEnvironment: IntegrationEnvironment = new IntegrationEnvironment()
jest.setTimeout(90000)

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

describe('Create timer', () => {
  beforeAll(async () => {
    await integrationEnvironment.start()
    timerDataAgent = integrationEnvironment.container.get<ITimerDataAgent>(TYPES.TimerDataAgent)
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

  it('Create Timer and return timer by id', async () => {
    const result = await postAPI(`timers`, timerRequest)
    const timer = await getAPI<any>(`timers/${result.data.staticId}`)
    expect(timer.data).not.toBeNull()
    expect(result.data.staticId).toEqual(timer.data.staticId)
    expect(timer.data.status).toEqual(TimerStatus.InProgress)
  })

  it('Should return not found if timer not found by timerStaticId', async () => {
    await postAPI(`timers`, timerRequest)
    try {
      await getAPI<any>(`timers/wrongStaticId`)
    } catch (e) {
      expect(e.response.data.errorCode).toBe('EDAT01')
      expect(e.response.data.message).toContain('MissingTimerDataForStaticId')
    }
  })

  it('Deactivated timer', async () => {
    const result = await postAPI(`timers`, timerRequest)
    await putAPI<any>(`timers/${result.data.staticId}/deactivate`)

    const timer = await getAPI<any>(`timers/${result.data.staticId}`)
    expect(timer.data.status).toEqual(TimerStatus.Closed)
  })

  it('Should throw a error if the not found timer for deactivated', async () => {
    try {
      await putAPI<any>(`timers/wrongStaticId/deactivate`)
    } catch (e) {
      expect(e.response.data.errorCode).toBe('EDAT01')
      expect(e.response.data.message).toContain('MissingTimerDataForStaticId')
    }
  })

  it('Return timer by context', async () => {
    const context = {
      lcId: uuid4()
    }
    const result = await postAPI(`timers`, {
      ...timerRequest,
      context
    })

    // {"lcId": "${context.lcId}"}
    const timer = await getAPI<any>(`timers?context=${JSON.stringify(context)}`)
    expect(result.data.staticId).toEqual(timer.data[0].staticId)
  })

  it('Should throw a error if the not found timer by context', async () => {
    try {
      await getAPI<any>(`timers?context={"lcId": "44444"}`)
    } catch (e) {
      expect(e.data.errorCode).toBe('EDAT01')
      expect(e.data.message).toContain('MissingTimerDataForStaticId')
    }
  })


  it('Cancel timer', async () => {
    const result = await postAPI(`timers`, timerRequest)

    await putAPI<any>(`timers/${result.data.staticId}/cancel`)
    const timer = await getAPI<any>(`timers/${result.data.staticId}`)
    expect(timer.data.status).toEqual(TimerStatus.Cancelled)
  })

  it('Should throw a error if the not found timer for cancel', async () => {
    try {
      await putAPI<any>(`timers/wrongStaticId/cancel`)
    } catch (e) {
      expect(e.response.data.errorCode).toBe('EDAT01')
      expect(e.response.data.message).toContain('MissingTimerDataForStaticId')
    }
  })

  it('Should delete timer', async () => {
    const result = await postAPI(`timers`, timerRequest)
    const deleted = await deleteAPI(`timers/${result.data.staticId}`)
    expect(deleted.status).toEqual(204)
  })

  it('Should not be able to delete timer because timer not found', async () => {
    try {
      await deleteAPI(`timers/wrongStaticId`)
    } catch (e) {
      expect(e.response.data.errorCode).toBe('EDAT01')
      expect(e.response.data.message).toContain('MissingTimerDataForStaticId')
    }
  })

  it('schedule and execute timer', async () => {
    const result = await postAPI(`timers`, {
      ...timerRequest,
      timerData: [{
        time: moment().add(3, 'seconds').toDate(),
        payload: {
          jobType: TIMER_JOB_TYPE.SendNotification,
          notification: { productId: 'timer' }
        }
      }]
    })
    expect(result).toBeDefined()

    await waitForExpect(async () => {
      const timer = await getAPI<any>(`timers/${result.data.staticId}`)
      expect(timer.data.status).toEqual(TimerStatus.Completed)
    }, 10000)
  })
})
