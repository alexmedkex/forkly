import 'reflect-metadata'

const mockAxiosGet = jest.fn<{}>()
const mockAxiosPost = jest.fn<{}>()
const mockAxiosPut = jest.fn<{}>()

jest.mock('axios', () => ({
  default: {
    get: mockAxiosGet,
    post: mockAxiosPost,
    put: mockAxiosPut
  }
}))

import { TimerServiceClient } from './TimerServiceClient'
import { ICreateTimerRequest, ITimerResponse, ICreateTimerResponse } from './ITimer'
import { MicroserviceConnectionException } from '../../exceptions'
import { TimerType, TimerDurationUnit } from '@komgo/types'

const mockTimer: ICreateTimerRequest = {
  timerType: TimerType.CalendarDays,
  duration: {
    duration: 5,
    unit: TimerDurationUnit.Days
  },
  timerData: [],
  context: {
    productId: 'product-id',
    subProductId: 'sub-product-id'
  }
}
const mockResponse: ICreateTimerResponse = {
  staticId: 'testid-123'
}

const mockTimerResponse: ITimerResponse = {
  submissionDateTime: new Date(),
  timerData: [
    {
      status: 'pending',
      retry: 0,
      timerId: '1898f14f-4871-40c1-941a-24386d843b20',
      time: new Date()
    }
  ]
}

let client: TimerServiceClient
let logger

describe('TimerServiceClient', () => {
  beforeEach(() => {
    mockAxiosPost.mockClear()
    mockAxiosGet.mockClear()
    mockAxiosPut.mockClear()
    client = new TimerServiceClient('', 10)
    logger = (client as any).logger
    logger.error = jest.fn()
  })

  it('should save data', async () => {
    mockAxiosPost.mockImplementation(() => {
      return {
        data: mockResponse
      }
    })
    const result = await client.saveTimer(mockTimer)
    expect(mockAxiosPost).toHaveBeenCalledWith(`/v0/timers`, mockTimer)
    expect(result).toMatchObject(mockResponse)
  })

  it('should fetch data', async () => {
    mockAxiosGet.mockImplementation(() => {
      return {
        data: mockTimerResponse,
        status: 200
      }
    })
    const result = await client.fetchTimer('staticId')
    expect(mockAxiosGet).toHaveBeenCalledWith(`/v0/timers/staticId`)
    expect(result).toMatchObject(mockTimerResponse)
  })

  it('should return null', async () => {
    mockAxiosPost.mockImplementation(() => {
      return {
        data: null
      }
    })
    const result = await client.saveTimer(mockTimer)
    expect(mockAxiosPost).toHaveBeenCalledWith(`/v0/timers`, mockTimer)
    expect(result).toEqual(null)
  })

  it('should throw error', async () => {
    mockAxiosPost.mockImplementation(() => {
      throw Error('timer error')
    })

    await expect(client.saveTimer(mockTimer)).rejects.toBeInstanceOf(Error)
    expect(logger.error).toHaveBeenCalled()
  })

  it('fetchData should throw error', async () => {
    mockAxiosGet.mockImplementation(() => {
      throw Error('timer error')
    })
    await expect(client.fetchTimer('123')).rejects.toBeInstanceOf(MicroserviceConnectionException)
    expect(logger.error).toHaveBeenCalled()
  })

  it('should deactivate timer', async () => {
    mockAxiosPut.mockImplementation()
    await client.deactivateTimer('123')
    expect(mockAxiosPut).toHaveBeenCalledWith(`/v0/timers/123/deactivate`)
  })

  it('deactivateTimer should throw error', async () => {
    mockAxiosPut.mockImplementation(() => {
      throw Error('timer error')
    })
    await expect(client.deactivateTimer('123')).rejects.toBeDefined()
  })
})
