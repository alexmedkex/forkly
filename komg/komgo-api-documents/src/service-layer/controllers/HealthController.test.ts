const mockMongo = jest.fn(() => ({ connected: true }))
const mockBC = jest.fn(() => ({ connected: true }))
const mockService = jest.fn(() => ({ connected: true }))
const mockMQ = jest.fn(() => ({ connected: true }))

jest.mock('@komgo/health-check', () => ({
  CheckerInstance: {
    checkMongoDB: mockMongo,
    checkService: mockService,
    checkRabbitMQ: mockMQ,
    checkBlockchain: mockBC
  }
}))

import { HealthController } from './HealthController'

describe('HealthController', () => {
  let healthController
  beforeEach(() => {
    healthController = new HealthController(
      undefined,
      'api-registry-url',
      'api-notif-url',
      'api-signer-url',
      'api-blockchain-signer-url',
      'api-users-url'
    )
  })

  it('should return undefined', async () => {
    const result = await healthController.Healthz()
    expect(result).toEqual(undefined)
  })

  it('should return all connections with status OK', async () => {
    const result = await healthController.Ready()
    expect(result).toEqual({
      apiNotif: 'OK',
      apiSigner: 'OK',
      apiBlockchainSigner: 'OK',
      apiRegistry: 'OK',
      blockchain: 'OK',
      mongo: 'OK',
      apiUsers: 'OK',
      rabbitMQ: 'OK'
    })
  })

  it('should return mongo status with error', async () => {
    mockMongo.mockImplementation(() => ({ connected: false, error: 'error' }))
    await expect(healthController.Ready()).rejects.toEqual({
      response: {
        apiNotif: 'OK',
        apiSigner: 'OK',
        apiBlockchainSigner: 'OK',
        apiRegistry: 'OK',
        blockchain: 'OK',
        mongo: 'error',
        apiUsers: 'OK',
        rabbitMQ: 'OK'
      },
      status: 500
    })
  })
})
