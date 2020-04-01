import { Checker, ICheckedStatus } from '@komgo/health-check'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { HealthController } from './HealthController'

const connectedStatus: ICheckedStatus = {
  connected: true
}
const errorStatus = { connected: false, error: 'error' }

const API_REGISTRY_BASE_URL = 'http://api-registry'

describe('HealthController', () => {
  let healthController: HealthController
  let mockDataAccess: any
  let mockChecker: jest.Mocked<Checker>

  beforeEach(() => {
    jest.resetAllMocks()
    mockChecker = createMockInstance(Checker)
    mockDataAccess = {
      connection: {
        readyState: 1
      }
    }

    healthController = new HealthController(mockDataAccess as any, mockChecker as any, API_REGISTRY_BASE_URL)
  })

  it('return OK when ready', async () => {
    mockChecker.checkMongoDB.mockReturnValueOnce(connectedStatus)
    mockChecker.checkRabbitMQ.mockResolvedValueOnce(connectedStatus)
    mockChecker.checkService.mockResolvedValueOnce(connectedStatus).mockResolvedValueOnce(connectedStatus)

    const result = await healthController.Ready()
    expect(result).toEqual({
      mongo: 'OK',
      rabbitMQ: 'OK',
      apiRegistry: 'OK'
    })
  })

  it('should return undefined for healthz endpoint', async () => {
    const result = await healthController.Healthz()
    expect(result).toEqual(undefined)
  })

  it('should return mongo status with error', async () => {
    mockChecker.checkMongoDB.mockReturnValueOnce(errorStatus)
    mockChecker.checkRabbitMQ.mockResolvedValueOnce(connectedStatus)
    mockChecker.checkService.mockResolvedValueOnce(connectedStatus).mockResolvedValueOnce(connectedStatus)

    await expect(healthController.Ready()).rejects.toEqual({
      thrown: true,
      response: {
        mongo: 'error',
        rabbitMQ: 'OK',
        apiRegistry: 'OK'
      },
      status: 500
    })
  })

  it('should check that rabbitMQ is up', async () => {
    mockChecker.checkMongoDB.mockReturnValueOnce(errorStatus)
    mockChecker.checkRabbitMQ.mockResolvedValueOnce(connectedStatus)
    mockChecker.checkService.mockResolvedValueOnce(errorStatus).mockResolvedValueOnce(errorStatus)

    await expect(healthController.Ready()).rejects.toEqual({
      thrown: true,
      response: {
        mongo: 'error',
        rabbitMQ: 'OK',
        apiRegistry: 'error'
      },
      status: 500
    })
  })

  it('should check that apiRegistry is up', async () => {
    mockChecker.checkMongoDB.mockReturnValueOnce(errorStatus)
    mockChecker.checkRabbitMQ.mockResolvedValueOnce(errorStatus)
    mockChecker.checkService.mockResolvedValueOnce(connectedStatus)

    await expect(healthController.Ready()).rejects.toEqual({
      thrown: true,
      response: {
        mongo: 'error',
        rabbitMQ: 'error',
        apiRegistry: 'OK'
      },
      status: 500
    })
  })
})
