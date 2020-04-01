import { Checker, ICheckedStatus } from '@komgo/health-check'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { HealthController } from './HealthController'

const API_RFP_BASE_URL = 'http://api-rfp'
const API_REGISTRY_BASE_URL = 'http://api-registry'
const API_TRADE_CARGO_BASE_URL = 'http://api-trade-cargo'
const API_NOTIF_BASE_URL = 'http://api-notif'

const connectedStatus: ICheckedStatus = { connected: true }
const errorStatus = { connected: false, error: 'error' }

describe('HealthController', () => {
  let healthController: HealthController
  let mockDataAccess: any
  let mockChecker: jest.Mocked<Checker>

  beforeEach(() => {
    mockChecker = createMockInstance(Checker)
    mockDataAccess = {
      connection: {
        readyState: 1
      }
    }

    healthController = new HealthController(
      mockDataAccess as any,
      mockChecker,
      API_RFP_BASE_URL,
      API_REGISTRY_BASE_URL,
      API_TRADE_CARGO_BASE_URL,
      API_NOTIF_BASE_URL
    )
  })

  it('return OK when ready', async () => {
    mockChecker.checkMongoDB.mockReturnValueOnce(connectedStatus)
    mockChecker.checkRabbitMQ.mockResolvedValueOnce(connectedStatus)
    mockChecker.checkService
      .mockResolvedValueOnce(connectedStatus)
      .mockResolvedValueOnce(connectedStatus)
      .mockResolvedValueOnce(connectedStatus)
      .mockResolvedValueOnce(connectedStatus)

    const result = await healthController.Ready()
    expect(result).toEqual({
      mongo: 'OK',
      rabbitMQ: 'OK',
      apiRFP: 'OK',
      apiRegistry: 'OK',
      apiTradeCargo: 'OK',
      apiNotif: 'OK'
    })
  })

  it('should return undefined for healthz endpoint', async () => {
    const result = await healthController.Healthz()
    expect(result).toEqual(undefined)
  })

  it('should check that mongoDB is up', async () => {
    mockChecker.checkMongoDB.mockReturnValueOnce(connectedStatus)
    mockChecker.checkRabbitMQ.mockResolvedValueOnce(errorStatus)
    mockChecker.checkService
      .mockResolvedValueOnce(errorStatus)
      .mockResolvedValueOnce(errorStatus)
      .mockResolvedValueOnce(errorStatus)
      .mockResolvedValueOnce(errorStatus)

    await expect(healthController.Ready()).rejects.toEqual({
      thrown: true,
      response: {
        mongo: 'OK',
        rabbitMQ: 'error',
        apiRFP: 'error',
        apiRegistry: 'error',
        apiTradeCargo: 'error',
        apiNotif: 'error'
      },
      status: 500
    })
  })

  it('should check that rabbitMQ is up', async () => {
    mockChecker.checkMongoDB.mockReturnValueOnce(errorStatus)
    mockChecker.checkRabbitMQ.mockResolvedValueOnce(connectedStatus)
    mockChecker.checkService
      .mockResolvedValueOnce(errorStatus)
      .mockResolvedValueOnce(errorStatus)
      .mockResolvedValueOnce(errorStatus)
      .mockResolvedValueOnce(errorStatus)

    await expect(healthController.Ready()).rejects.toEqual({
      thrown: true,
      response: {
        mongo: 'error',
        rabbitMQ: 'OK',
        apiRFP: 'error',
        apiRegistry: 'error',
        apiTradeCargo: 'error',
        apiNotif: 'error'
      },
      status: 500
    })
  })

  it('should check that apiRFP is up', async () => {
    mockChecker.checkMongoDB.mockReturnValueOnce(errorStatus)
    mockChecker.checkRabbitMQ.mockResolvedValueOnce(errorStatus)
    mockChecker.checkService
      .mockResolvedValueOnce(connectedStatus)
      .mockResolvedValueOnce(errorStatus)
      .mockResolvedValueOnce(errorStatus)
      .mockResolvedValueOnce(errorStatus)

    await expect(healthController.Ready()).rejects.toEqual({
      thrown: true,
      response: {
        mongo: 'error',
        rabbitMQ: 'error',
        apiRFP: 'OK',
        apiRegistry: 'error',
        apiTradeCargo: 'error',
        apiNotif: 'error'
      },
      status: 500
    })
  })

  it('should check that apiRegistry is up', async () => {
    mockChecker.checkMongoDB.mockReturnValueOnce(errorStatus)
    mockChecker.checkRabbitMQ.mockResolvedValueOnce(errorStatus)
    mockChecker.checkService
      .mockResolvedValueOnce(errorStatus)
      .mockResolvedValueOnce(connectedStatus)
      .mockResolvedValueOnce(errorStatus)
      .mockResolvedValueOnce(errorStatus)

    await expect(healthController.Ready()).rejects.toEqual({
      thrown: true,
      response: {
        mongo: 'error',
        rabbitMQ: 'error',
        apiRFP: 'error',
        apiRegistry: 'OK',
        apiTradeCargo: 'error',
        apiNotif: 'error'
      },
      status: 500
    })
  })

  it('should check that apiTradeCargo is up', async () => {
    mockChecker.checkMongoDB.mockReturnValueOnce(errorStatus)
    mockChecker.checkRabbitMQ.mockResolvedValueOnce(errorStatus)
    mockChecker.checkService
      .mockResolvedValueOnce(errorStatus)
      .mockResolvedValueOnce(errorStatus)
      .mockResolvedValueOnce(connectedStatus)
      .mockResolvedValueOnce(errorStatus)

    await expect(healthController.Ready()).rejects.toEqual({
      thrown: true,
      response: {
        mongo: 'error',
        rabbitMQ: 'error',
        apiRFP: 'error',
        apiRegistry: 'error',
        apiTradeCargo: 'OK',
        apiNotif: 'error'
      },
      status: 500
    })
  })

  it('should check that apiNotif is up', async () => {
    mockChecker.checkMongoDB.mockReturnValueOnce(errorStatus)
    mockChecker.checkRabbitMQ.mockResolvedValueOnce(errorStatus)
    mockChecker.checkService
      .mockResolvedValueOnce(errorStatus)
      .mockResolvedValueOnce(errorStatus)
      .mockResolvedValueOnce(errorStatus)
      .mockResolvedValueOnce(connectedStatus)

    await expect(healthController.Ready()).rejects.toEqual({
      thrown: true,
      response: {
        mongo: 'error',
        rabbitMQ: 'error',
        apiRFP: 'error',
        apiRegistry: 'error',
        apiTradeCargo: 'error',
        apiNotif: 'OK'
      },
      status: 500
    })
  })
})
