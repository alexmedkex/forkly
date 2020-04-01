import 'reflect-metadata'
const mockMongo = jest.fn(() => ({ connected: true }))
const mockService = jest.fn(() => ({ connected: true }))
const mockMQ = jest.fn(() => ({ connected: true }))

jest.mock('@komgo/health-check', () => ({
  CheckerInstance: {
    checkMongoDB: mockMongo,
    checkService: mockService,
    checkRabbitMQ: mockMQ
  }
}))

import { HealthController } from './HealthController'

describe('HealthController', () => {
  let healthController
  beforeEach(() => {
    healthController = new HealthController()
    mockMongo.mockClear()
    mockService.mockClear()
  })

  it('should return undefined', async () => {
    const result = await healthController.Healthz()
    expect(result).toEqual(undefined)
  })

  it('should return all connections with status OK', async () => {
    const result = await healthController.Ready()
    expect(result).toEqual({
      mongo: 'OK',
      'api-users': 'OK',
      'api-roles': 'OK'
    })
  })

  it('should return mongo status with error', async () => {
    mockMongo.mockImplementation(() => ({ connected: false, error: 'error' }))
    await expect(healthController.Ready()).rejects.toEqual({
      response: {
        mongo: 'error',
        'api-users': 'OK',
        'api-roles': 'OK'
      },
      status: 500
    })
  })

  it('should return api-users status with error', async () => {
    mockMongo.mockImplementation(() => ({ connected: true }))
    mockService.mockImplementation(() => ({ connected: false, error: 'error' }))
    await expect(healthController.Ready()).rejects.toEqual({
      response: {
        mongo: 'OK',
        'api-users': 'error',
        'api-roles': 'error'
      },
      status: 500
    })
  })

  it('should reject', async () => {
    mockMongo.mockImplementation(() => ({ connected: true }))
    mockService.mockImplementation(() => ({ connected: false, error: 'error' }))
    await expect(healthController.Ready()).rejects.toEqual({
      response: {
        mongo: 'OK',
        'api-users': 'error',
        'api-roles': 'error'
      },
      status: 500
    })
  })
})
