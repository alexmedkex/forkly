import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import BlockchainEventService from './BlockchainEventService'
import IService from './IService'
import PrivateAutoWhitelistService from './PrivateAutoWhitelistService'
import PublicAutoWhitelistService from './PublicAutoWhitelistService'
import RunnerService from './RunnerService'

describe('RunnerService', () => {
  let service: RunnerService
  let mockBlockchainEventService: jest.Mocked<IService>
  let mockPublicAutoWhitelistService: jest.Mocked<PublicAutoWhitelistService>
  let mockPrivateAutoWhitelistService: jest.Mocked<PrivateAutoWhitelistService>

  beforeEach(() => {
    mockBlockchainEventService = createMockInstance(BlockchainEventService)
    mockPrivateAutoWhitelistService = createMockInstance(PrivateAutoWhitelistService)
    mockPublicAutoWhitelistService = createMockInstance(PublicAutoWhitelistService)

    mockPrivateAutoWhitelistService.start.mockResolvedValue(null)
    mockPublicAutoWhitelistService.start.mockResolvedValue(null)
    mockBlockchainEventService.start.mockResolvedValue(null)

    service = new RunnerService(
      mockBlockchainEventService,
      mockPrivateAutoWhitelistService,
      mockPublicAutoWhitelistService
    )
  })

  it('should start all services', async () => {
    await service.start()

    expect(mockBlockchainEventService.start).toHaveBeenCalledTimes(1)
    expect(mockPublicAutoWhitelistService.start).toHaveBeenCalledTimes(1)
    expect(mockPrivateAutoWhitelistService.start).toHaveBeenCalledTimes(1)
  })

  it('should retry auto-whitelisting services', async () => {
    mockPublicAutoWhitelistService.start.mockRejectedValueOnce(new Error('msg'))
    mockPrivateAutoWhitelistService.start.mockRejectedValueOnce(new Error('msg'))

    await service.start()

    expect(mockPrivateAutoWhitelistService.start).toHaveBeenCalledTimes(2)
    expect(mockPublicAutoWhitelistService.start).toHaveBeenCalledTimes(3)
    expect(mockBlockchainEventService.start).toHaveBeenCalledTimes(1)
  })

  it('should stop BlockchainEventService', async () => {
    service.stop()

    expect(mockBlockchainEventService.stop).toHaveBeenCalledTimes(1)
  })
})
