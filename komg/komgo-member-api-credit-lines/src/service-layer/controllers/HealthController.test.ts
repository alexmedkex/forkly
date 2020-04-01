import 'reflect-metadata'

const mockMongo = jest.fn(() => ({ connected: true }))
const mockService = jest.fn(() => ({ connected: true }))

jest.mock('@komgo/health-check', () => ({
  CheckerInstance: {
    checkMongoDB: mockMongo,
    checkService: mockService
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
      'api-coverage': 'OK',
      'api-registry': 'OK'
    })
  })

  it('should return mongo status with error', async () => {
    mockMongo.mockImplementation(() => ({ connected: false, error: 'error' }))
    await expect(healthController.Ready()).rejects.toEqual({
      thrown: true,
      response: {
        mongo: 'error',
        'api-coverage': 'OK',
        'api-registry': 'OK'
      },
      status: 500
    })
  })
})
