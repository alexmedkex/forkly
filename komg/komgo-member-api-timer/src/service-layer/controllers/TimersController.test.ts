import { ITimerDataAgent } from '../../data-layer/data-agents/ITimerDataAgent'
import { TimersController } from './TimersController'
import { ICreateTimerRequest } from '../requests/timer'
import { DurationUnit } from '../../data-layer/models/DurationUnit'
import { DataAccessException, DATA_ACCESS_ERROR } from '../../data-layer/exceptions/DataAccessException'
import { ITimerScheduleService } from '../../business-layer/schedule/TimerScheduleService'
import { TimerStatus } from '../../data-layer/models/TimerStatus'

let agent: ITimerDataAgent

const timerCreateRequest: ICreateTimerRequest = {
  duration: {
    duration: 5,
    unit: DurationUnit.Days
  },
  timerData: [
    {
      time: new Date(),
      payload: {}
    }
  ],
  context: {}
}

let timerScheduleService: ITimerScheduleService

describe('TimersController', () => {
  let controller: TimersController

  beforeEach(() => {
    agent = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateStatus: jest.fn(),
      get: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn()
    }
    timerScheduleService = {
      start: jest.fn(),
      stopTimer: jest.fn(),
      scheduleJobs: jest.fn()
    }
    controller = new TimersController(agent, timerScheduleService)
  })

  it('should create new timer successfully', async () => {
    agent.create = jest.fn().mockImplementation(() => Promise.resolve({ strictId: '123456789' }))

    const result = await controller.create(timerCreateRequest)
    expect(result.staticId).toBeDefined()
  })

  it('should failed on create new timer - database error', async () => {
    agent.create = jest.fn().mockImplementation(() => {
      throw new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'InvalidTimerData')
    })

    await expect(controller.create(timerCreateRequest)).rejects.toThrowError(Error)
  })

  it('should failed on create new timer - error with unknown origin', async () => {
    agent.create = jest.fn().mockImplementation(() => {
      throw new Error()
    })

    await expect(controller.create(timerCreateRequest)).rejects.toThrowError(Error)
  })

  it('should successfully deactivate timer', async () => {
    agent.updateStatus = jest.fn().mockImplementation(() => Promise.resolve())
    const result = await controller.deactivate('1')
    expect(timerScheduleService.stopTimer).toBeCalledWith('1', TimerStatus.Closed)
    expect(result).toEqual(undefined)
  })

  it('should successfully cancel timer', async () => {
    agent.updateStatus = jest.fn().mockImplementation(() => Promise.resolve())
    const result = await controller.cancel('1')
    expect(result).toEqual(undefined)
    expect(timerScheduleService.stopTimer).toBeCalledWith('1', TimerStatus.Cancelled)
  })

  it('Should find timer using staticId', async () => {
    const staticId = '123'
    agent.get = jest.fn().mockImplementation(() => {
      return {
        staticId: '123'
      }
    })
    controller.getById(staticId)
    await expect(agent.get).toHaveBeenCalled()
  })

  it('Should throw a error if the not found timer by static id', async () => {
    const staticId = '123'
    agent.get = jest.fn().mockImplementation(() => {
      throw new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, 'NotFound')
    })
    const result = controller.getById(staticId)
    await expect(result).rejects.toThrowError(Error)
  })

  it('should failed on getTimerByStaticId - error with unknown origin', async () => {
    const staticId = '123'
    agent.get = jest.fn().mockImplementation(() => {
      throw new Error()
    })
    const result = controller.getById(staticId)
    await expect(result).rejects.toThrowError(Error)
  })
  it('Should find timer using context', async () => {
    const context = '{ "lcId": "123" }'
    agent.find = jest.fn().mockImplementation(() => {
      return [
        {
          staticId: '123',
          context: {
            lcId: '123'
          }
        }
      ]
    })
    controller.getTimers(context)
    await expect(agent.find).toHaveBeenCalled()
  })

  it('Should throw a error if the not found timer by context', async () => {
    const context = '{ "lcId": "123" }'
    agent.find = jest.fn().mockImplementation(() => {
      throw new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, 'Not found timer')
    })
    const result = controller.getTimers(context)
    await expect(result).rejects.toThrowError(Error)
  })
})
