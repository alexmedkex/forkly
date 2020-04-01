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
  })

  it('should return undefined', async () => {
    const result = await healthController.Healthz()
    expect(result).toEqual(undefined)
  })

  it('should return all connections with status OK', async () => {
    const result = await healthController.Ready()
    expect(result).toEqual({
      mongo: 'OK',
      rabbitMQ: 'OK',
      'api-notif': 'OK',
      'api-registry': 'OK',
      'api-coverage': 'OK'
    })
  })

  it('should return mongo status with error', async () => {
    mockMongo.mockImplementation(() => ({ connected: false, error: 'error' }))
    await expect(healthController.Ready()).rejects.toEqual({
      thrown: true,
      response: {
        mongo: 'error',
        rabbitMQ: 'OK',
        'api-notif': 'OK',
        'api-registry': 'OK',
        'api-coverage': 'OK'
      },
      status: 500
    })
  })
})
