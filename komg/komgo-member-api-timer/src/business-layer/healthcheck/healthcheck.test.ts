const getMock = jest.fn(() => Promise.resolve(null))
const publish = jest.fn(() => Promise.resolve(null))

jest.mock('axios', () => ({ default: { get: getMock } }))

jest.mock('@komgo/messaging-library', () => ({
  MessagingFactory: jest.fn(() => ({ createPublisher: jest.fn(() => ({ publish })) }))
}))
import { checkService, reportHealthStatus, startHealthReporter } from './healthcheck'
import * as schedule from 'node-schedule'

describe('healthcheck test', () => {
  it('should return ready=true on checkService', async () => {
    getMock.mockImplementation(() => Promise.resolve({ data: 'data', status: 200 }))
    const result = await checkService('test-service', 'test-url')
    expect(result).toEqual({ 'test-service': { readinessStatus: 'data', ready: 1 } })
  })

  it('should return ready=false on if checkService fails', async () => {
    getMock.mockImplementation(() => Promise.resolve({ data: 'data', status: 500 }))
    const result = await checkService('test-service', 'test-url')
    expect(result).toEqual({ 'test-service': { readinessStatus: 'data', ready: 0 } })
  })

  it('should return ready=false if checkService fails with an exception', async () => {
    getMock.mockImplementation(() => Promise.reject(new Error('Oops!')))
    const result = await checkService('test-service', 'test-url')
    expect(result).toEqual({
      'test-service': {
        ready: 0,
        readinessStatus: {
          error: 'Oops!'
        }
      }
    })
  })

  it('should call publish on reportHealthStatus', async () => {
    await reportHealthStatus()
    expect(publish).toHaveBeenCalled()
  })

  it('should call scheduleJob on startHealthReporter', () => {
    schedule.scheduleJob = jest.fn()
    startHealthReporter()
    expect(schedule.scheduleJob).toHaveBeenCalled()
  })
})
