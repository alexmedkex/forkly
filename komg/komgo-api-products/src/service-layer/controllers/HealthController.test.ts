const mockMongo = jest.fn(() => ({ connected: true }))
const mockBC = jest.fn(() => ({ connected: true }))

jest.mock('@komgo/health-check', () => ({
  CheckerInstance: {
    checkMongoDB: mockMongo,
    checkBlockchain: mockBC
  }
}))

import { HealthController } from './HealthController'

describe('HealthController', () => {
  let healthController
  beforeAll(() => {
    healthController = new HealthController()
    healthController.web3 = { web3Instance: jest.fn() }
  })

  it('should return undefined', async () => {
    const result = await healthController.Healthz()
    expect(result).toEqual(undefined)
  })

  it('should return all connections with status OK', async () => {
    const result = await healthController.Ready()
    expect(result).toEqual({
      blockchain: 'OK',
      mongo: 'OK'
    })
  })

  it('should return mongo status with error', async () => {
    mockMongo.mockImplementation(() => ({ connected: false, error: 'error' }))
    await expect(healthController.Ready()).rejects.toEqual({
      response: {
        blockchain: 'OK',
        mongo: 'error'
      },
      status: 500
    })
  })

  it('should return mongo status with OK', async () => {
    mockMongo.mockImplementation(() => ({ connected: false }))
    await expect(healthController.Ready()).rejects.toEqual({
      response: {
        blockchain: 'OK',
        mongo: 'OK'
      },
      status: 500
    })
  })
})
