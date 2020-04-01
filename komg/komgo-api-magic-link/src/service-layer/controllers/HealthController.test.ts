const mockMongo = jest.fn(() => ({ connected: true }))
const mockBC = jest.fn(() => ({ connected: true }))
const mockService = jest.fn(() => ({ connected: true }))

jest.mock('@komgo/health-check', () => ({
  CheckerInstance: {
    checkMongoDB: mockMongo,
    checkService: mockService,
    checkBlockchain: mockBC
  }
}))

import { HealthController } from './HealthController'

describe('HealthController', () => {
  let healthController
  beforeAll(() => {
    healthController = new HealthController()
  })

  it('should return undefined', async () => {
    const result = await healthController.Healthz()
    expect(result).toEqual(undefined)
  })

  it('should return all connections with status OK', async () => {
    const result = await healthController.Ready()
    expect(result).toEqual({
      apiSigner: 'OK',
      apiRegistry: 'OK',
      blockchain: 'OK',
      mongo: 'OK'
    })
  })

  it('should return mongo status with error', async () => {
    mockMongo.mockImplementation(() => ({ connected: false, error: 'error' }))
    await expect(healthController.Ready()).rejects.toEqual({
      response: {
        apiSigner: 'OK',
        apiRegistry: 'OK',
        blockchain: 'OK',
        mongo: 'error'
      },
      status: 500
    })
  })
})
