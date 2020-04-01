import 'jest'
import 'reflect-metadata'

import { Checker, ICheckedStatus } from '@komgo/health-check'
import { createMockInstance } from 'jest-create-mock-instance'

import { HealthController } from './HealthController'

const mockWeb3 = jest.fn()

const connectedStatus: ICheckedStatus = {
  connected: true
}

const notConnectedStatus: ICheckedStatus = {
  connected: false
}

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

    healthController = new HealthController(mockWeb3, mockDataAccess as any, mockChecker as any)
  })

  it('testName', async () => {
    mockChecker.checkBlockchain.mockResolvedValue(connectedStatus)
    mockChecker.checkMongoDB.mockReturnValue(connectedStatus)

    const result = await healthController.Ready()
    expect(result).toEqual({
      blockchain: 'OK',
      mongo: 'OK'
    })
  })

  it('test blockchain not connect but mongo yes', async () => {
    mockChecker.checkBlockchain.mockResolvedValue(connectedStatus)
    mockChecker.checkMongoDB.mockReturnValue(notConnectedStatus)

    expect(healthController.Ready()).rejects.toMatchObject({
      thrown: true,
      status: 500
    })
  })

  it('healthz method exists', async () => {
    expect(healthController.Healthz()).resolves.toBeDefined()
  })
})
