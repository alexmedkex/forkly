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
      'apiRegistryUrl',
      'tradeCargoUrl',
      'notifUrl',
      'signerUrl',
      'documentsServiceUrl'
    )
  })

  it('should return undefined', async () => {
    const result = await healthController.Healthz()
    expect(result).toEqual(undefined)
  })

  it('should return all connections with status OK', async () => {
    const result = await healthController.Ready()
    expect(result).toEqual({
      mongo: 'OK',
      blockchain: 'OK',
      rabbitMQ: 'OK',
      'api-notif': 'OK',
      'api-signer': 'OK',
      'api-registry': 'OK',
      'api-documents': 'OK',
      'api-trade-cargo': 'OK'
    })
  })

  it('should return mongo status with error', async () => {
    mockMongo.mockImplementation(() => ({ connected: false, error: 'error' }))
    await expect(healthController.Ready()).rejects.toEqual({
      thrown: true,
      response: {
        mongo: 'error',
        blockchain: 'OK',
        rabbitMQ: 'OK',
        'api-notif': 'OK',
        'api-signer': 'OK',
        'api-registry': 'OK',
        'api-documents': 'OK',
        'api-trade-cargo': 'OK'
      },
      status: 500
    })
  })
})
