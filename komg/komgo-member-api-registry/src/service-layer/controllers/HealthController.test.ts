const mockMongo = jest.fn(() => ({ connected: true }))
const mockBC = jest.fn(() => ({ connected: true }))
const mockMQ = jest.fn(() => ({ connected: true }))
const mockService = jest.fn(() => ({ connected: true }))

jest.mock('@komgo/health-check', () => ({
  CheckerInstance: {
    checkMongoDB: mockMongo,
    checkRabbitMQ: mockMQ,
    checkBlockchain: mockBC,
    checkService: mockService
  }
}))

import { HealthController } from './HealthController'

describe('HealthController', () => {
  let healthController
  beforeEach(() => {
    healthController = new HealthController(null, 'string', 'string')
  })

  it('should return undefined', async () => {
    const result = await healthController.Healthz()
    expect(result).toEqual(undefined)
  })

  it('should return all connections with status OK', async () => {
    const result = await healthController.Ready()
    expect(result).toEqual({
      blockchain: 'OK',
      mongo: 'OK',
      rabbitMQ: 'OK',
      signer: 'OK',
      blockchainSigner: 'OK'
    })
  })

  it('should return mongo status with error', async () => {
    mockMongo.mockImplementation(() => ({ connected: false, error: 'error' }))
    await expect(healthController.Ready()).rejects.toEqual({
      thrown: true,
      response: {
        blockchain: 'OK',
        mongo: 'error',
        rabbitMQ: 'OK',
        signer: 'OK',
        blockchainSigner: 'OK'
      },
      status: 500
    })
  })
})
