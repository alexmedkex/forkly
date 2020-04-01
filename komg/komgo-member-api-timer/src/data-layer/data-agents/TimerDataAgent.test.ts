import 'reflect-metadata'

import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'

const timerRepo = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  findOneAndUpdate: jest.fn()
}

jest.mock('../mongodb/TimerRepo', () => ({
  TimerRepo: timerRepo
}))

import { Timer } from '../models/Timer'
import TimerDataAgent from './TimerDataAgent'
import { ITimer } from '../models/ITimer'
import { DATA_ACCESS_ERROR, DataAccessException } from '../exceptions/DataAccessException'
import { TimerStatus } from '../models/TimerStatus'
import { TimerType } from '../models/TimerType'
import { TimerDataStatus } from '../models/TimerDataStatus'

const mockTimer: ITimer = {
  staticId: '1234',
  status: TimerStatus.InProgress,
  timerType: TimerType.CalendarDays,
  submissionDateTime: new Date(),
  duration: {
    unit: 'weeks',
    duration: 0
  },
  timerData: [
    {
      status: TimerDataStatus.Pending,
      retry: 0,
      time: new Date(),
      timerId: 'b21af173-643c-4096-a64b-be4902c9fa5f'
    }
  ],
  context: {
    lcId: '1234'
  }
}

describe('TimerDataAgent', () => {
  const timer = new TimerDataAgent()
  beforeEach(() => {
    timerRepo.find.mockReset()
    timerRepo.create.mockReset()
    timerRepo.findOne.mockReset()
    timerRepo.delete.mockReset()
    timerRepo.update.mockReset()
    timerRepo.find.mockReset()
    timerRepo.count.mockReset()
    timerRepo.findOneAndUpdate.mockReset()
  })

  it('is defined', () => {
    expect(new TimerDataAgent()).toBeDefined()
  })

  it('Should create new timer', async () => {
    timerRepo.create.mockImplementation(() => {
      return {
        staticId: '123'
      }
    })
    await timer.create(mockTimer)
    expect(timerRepo.create).toHaveBeenCalled()
  })

  it('Should throw a error if the new data is invalid', async () => {
    timerRepo.create.mockImplementation(() => {
      throw new Error('Invalid data')
    })
    const result = timer.create(mockTimer)
    await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
  })

  it('Should be get timer by context', async () => {
    const context = {
      lcId: '123'
    }
    timerRepo.find.mockImplementation(() => {
      return [
        {
          staticId: '123',
          context: {
            lcId: '123'
          }
        }
      ]
    })
    await timer.find(null, context)
    expect(timerRepo.find).toHaveBeenCalled()
  })

  it('Should throw a error if the data for get by staticId is invalid', async () => {
    const context = {
      lcId: '123'
    }
    timerRepo.find.mockImplementation(() => {
      throw new Error('Invalid data')
    })
    const result = timer.find(null, context)
    await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
  })

  it('Should be get timer by static id', async () => {
    const staticId = '123'
    timerRepo.findOne.mockImplementation(() => {
      return {
        staticId: '123'
      }
    })
    await timer.get(staticId)
    expect(timerRepo.findOne).toHaveBeenCalled()
  })

  it('Should throw a error if the not found timer by static id', async () => {
    const staticId = '123'
    timerRepo.findOne.mockImplementation(() => {
      return null
    })
    const result = timer.get(staticId)
    await expect(result).rejects.toEqual(
      new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, 'MissingTimerDataForStaticId')
    )
  })

  it('Should throw a error if the data for get by static id is invalid', async () => {
    const staticId = '123'
    timerRepo.findOne.mockImplementation(() => {
      throw new Error('Invalid data')
    })
    const result = timer.get(staticId)
    await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
  })

  it('findOne', async () => {
    await expect(new TimerDataAgent().findOne(null)).rejects.toThrowError(DataAccessException)
  })

  it('update', async () => {
    await expect(new TimerDataAgent().update(null, null)).rejects.toThrowError(DataAccessException)
  })

  it('delete', async () => {
    await expect(new TimerDataAgent().delete(null)).rejects.toThrowError(DataAccessException)
  })

  it('should delete timer for provided timerStaticId (staticId)', async () => {
    const mockedTimerResult = {
      ...mockTimer,
      save: jest.fn(),
      set: jest.fn()
    }
    timerRepo.findOne.mockImplementation(() => mockedTimerResult)
    await timer.delete('1111')
    expect(mockedTimerResult.save).toHaveBeenCalledTimes(1)
  })

  it('should failed to delete timer for provided timerStaticId (staticId). Already deleted', async () => {
    const mockedTimerResult = {
      ...mockTimer,
      deletedAt: new Date(),
      save: jest.fn(),
      set: jest.fn()
    }
    timerRepo.findOne.mockImplementation(() => mockedTimerResult)
    await expect(timer.delete('1111')).rejects.toThrowError(DataAccessException)
  })

  it('should failed to delete timer for provided timerStaticId (staticId). Save should throw an exception', async () => {
    const mockedTimerResult = {
      ...mockTimer,
      save: jest.fn(),
      set: jest.fn()
    }
    mockedTimerResult.save.mockImplementation(() => {
      const err = new Error('Error')
      err.name = 'ValidationError'
      const error = {
        ...err,
        errors: []
      }
      throw error
    })
    timerRepo.findOne.mockImplementation(() => mockedTimerResult)
    await expect(timer.delete('1111')).rejects.toThrowError(DataAccessException)
  })

  it('count', async () => {
    await expect(new TimerDataAgent().count(null)).rejects.toThrowError(DataAccessException)
  })

  it('should updateStatus (closed) timer for provided timerStaticId (staticId)', async () => {
    const mockedTimerResult = {
      ...mockTimer,
      save: jest.fn()
    }
    timerRepo.findOne.mockImplementation(() => mockedTimerResult)
    await timer.updateStatus('1111', TimerStatus.Closed)
    expect(mockedTimerResult.save).toHaveBeenCalledTimes(1)
  })

  it('should throw updateStatus for wrong status', async () => {
    timerRepo.findOne.mockImplementation(() => {
      throw new Error('Timer is already is status inProgress')
    })
    const result = timer.updateStatus('1111', TimerStatus.InProgress)
    await expect(result).rejects.toThrow()
  })

  it('should return undefined from updateStatus for wrong status', async () => {
    const mockedTimerResult = {
      ...mockTimer,
      save: jest.fn()
    }
    timerRepo.findOne.mockImplementation(() => mockedTimerResult)
    // @ts-ignore
    const result = timer.updateStatus('1111', '')
    await expect(result).resolves.toEqual(undefined)
  })

  it('should failed to close timer for provided timerStaticId (staticId). Timer is already closed', async () => {
    const mockedTimerResult = {
      ...mockTimer,
      status: TimerStatus.Closed,
      save: jest.fn(),
      set: jest.fn()
    }
    timerRepo.findOne.mockImplementation(() => mockedTimerResult)
    await expect(timer.updateStatus('1111', TimerStatus.Closed)).rejects.toThrowError(DataAccessException)
  })

  it('should updateStatus (cancel) timer for provided timerStaticId (staticId)', async () => {
    const mockedTimerResult = {
      ...mockTimer,
      save: jest.fn()
    }
    timerRepo.findOne.mockImplementation(() => mockedTimerResult)
    await timer.updateStatus('1111', TimerStatus.Cancelled)
    expect(mockedTimerResult.save).toHaveBeenCalledTimes(1)
  })

  it('should failed to cancel timer for provided timerStaticId (staticId). Timer is already canceled', async () => {
    const mockedTimerResult = {
      ...mockTimer,
      status: TimerStatus.Cancelled,
      save: jest.fn(),
      set: jest.fn()
    }
    timerRepo.findOne.mockImplementation(() => mockedTimerResult)
    await expect(timer.updateStatus('1111', TimerStatus.Cancelled)).rejects.toThrowError(DataAccessException)
  })

  it('should failed to cancel timer for provided timerStaticId (staticId). Timer is deleted', async () => {
    const mockedTimerResult = {
      ...mockTimer,
      status: TimerStatus.InProgress,
      deletedAt: new Date(),
      save: jest.fn(),
      set: jest.fn()
    }
    timerRepo.findOne.mockImplementation(() => mockedTimerResult)
    await expect(timer.updateStatus('1111', TimerStatus.Cancelled)).rejects.toThrowError(DataAccessException)
  })

  it('should updateStatus timer for provided timerStaticId (staticId)', async () => {
    const mockedTimerResult = {
      ...mockTimer,
      save: jest.fn()
    }
    timerRepo.findOne.mockImplementation(() => mockedTimerResult)
    await timer.updateStatus('1111', TimerStatus.Completed)
    expect(mockedTimerResult.save).toHaveBeenCalledTimes(1)
  })

  it('should updateStatus (cancel) timer for provided timerStaticId (staticId)', async () => {
    const mockedTimerResult = {
      ...mockTimer,
      save: jest.fn()
    }
    timerRepo.findOne.mockImplementation(() => mockedTimerResult)
    await timer.updateStatus('1111', TimerStatus.Cancelled)
    expect(mockedTimerResult.save).toHaveBeenCalledTimes(1)
  })

  it('should updateField (status) timer for provided timerStaticId (staticId)', async () => {
    await timer.updateField('1111', 'status', TimerStatus.Cancelled)
    expect(timerRepo.findOneAndUpdate).toHaveBeenCalledWith(
      { staticId: '1111' },
      { $set: { status: TimerStatus.Cancelled } }
    )
  })

  it('should throw an error in updateField', async () => {
    timerRepo.findOneAndUpdate.mockImplementation(() => {
      throw new Error('Invalid data')
    })
    const result = timer.updateField('1111', 'status', TimerStatus.Cancelled)
    await expect(result).rejects.toThrow()
  })

  it('should throw an error in updatePushArray', async () => {
    timerRepo.findOneAndUpdate.mockImplementation(() => {
      throw new Error('Invalid data')
    })
    const result = timer.updatePushArray('1111', 'timerData', { a: 1 })
    await expect(result).rejects.toThrow()
  })

  it('should updateField (retry) timer for provided timerStaticId (staticId)', async () => {
    await timer.updatePushArray('1111', 'timerData', { a: 1 })
    expect(timerRepo.findOneAndUpdate).toHaveBeenCalledWith({ staticId: '1111' }, { $push: { timerData: { a: 1 } } })
  })
})
