const mockMongo = jest.fn(() => ({ connected: true }))
const mockService = jest.fn(() => ({ connected: true }))
const mockHarbor = jest.fn(() => ({ connected: true }))

jest.mock('@komgo/health-check', () => ({
  CheckerInstance: {
    checkMongoDB: mockMongo,
    checkService: mockService,
    checkHarbor: mockHarbor
  }
}))

import { HealthController } from './HealthController'

describe('HealthController', () => {
  let healthController
  beforeAll(() => {
    healthController = new HealthController()
    healthController.commonMessagingService = { getVhosts: jest.fn() }
  })

  it('should return undefined', async () => {
    const result = await healthController.Healthz()
    expect(result).toEqual(undefined)
  })

  it('should return all connections with status OK', async () => {
    const result = await healthController.Ready()
    expect(result).toEqual({
      apiUsers: 'OK',
      apiRegistry: 'OK',
      commonMessagingAgent: 'OK',
      mongo: 'OK',
      harbor: 'OK'
    })
  })

  it('should return commonMessagingAgent status with error', async () => {
    healthController.commonMessagingService = {
      getVhosts: jest.fn(() => {
        throw { message: 'error' }
      })
    }

    await expect(healthController.Ready()).rejects.toEqual({
      response: {
        apiUsers: 'OK',
        apiRegistry: 'OK',
        commonMessagingAgent: 'error',
        mongo: 'OK',
        harbor: 'OK'
      },
      status: 500
    })
  })

  it('should return mongo status with error', async () => {
    mockMongo.mockImplementation(() => ({ connected: false, error: 'error' }))
    healthController.commonMessagingService = { getVhosts: jest.fn() }
    await expect(healthController.Ready()).rejects.toEqual({
      response: {
        apiUsers: 'OK',
        apiRegistry: 'OK',
        commonMessagingAgent: 'OK',
        mongo: 'error',
        harbor: 'OK'
      },
      status: 500
    })
  })

  it('should return harbor status with error', async () => {
    mockHarbor.mockImplementation(() => ({ connected: false, error: 'error' }))
    mockMongo.mockImplementation(() => ({ connected: true }))
    healthController.commonMessagingService = { getVhosts: jest.fn() }
    await expect(healthController.Ready()).rejects.toEqual({
      response: {
        apiUsers: 'OK',
        apiRegistry: 'OK',
        commonMessagingAgent: 'OK',
        mongo: 'OK',
        harbor: 'error'
      },
      status: 500
    })
  })
})
