import 'jest'
import 'reflect-metadata'

import createMockInstance from 'jest-create-mock-instance'

import MessagingClient from '../../business-layer/transactions/MessagingClient'

import LifecycleManagementService from './LifecycleManagementService'
import TransactionSendService from './TransactionSendService'

describe('LifecycleManagementService', () => {
  let service: LifecycleManagementService
  let mockTransactionSendService: jest.Mocked<TransactionSendService>
  let mockMessagingClient: jest.Mocked<MessagingClient>

  beforeEach(() => {
    mockTransactionSendService = createMockInstance(TransactionSendService)
    mockMessagingClient = createMockInstance(MessagingClient)

    service = new LifecycleManagementService(mockTransactionSendService, mockMessagingClient)
  })

  it('should start all services', async () => {
    await service.start()

    expect(mockTransactionSendService.start).toHaveBeenCalledTimes(1)
    expect(mockMessagingClient.start).toHaveBeenCalledTimes(1)
  })

  it('should start all services', async () => {
    await service.stop()

    expect(mockTransactionSendService.stop).toHaveBeenCalledTimes(1)
    expect(mockMessagingClient.stop).toHaveBeenCalledTimes(1)
  })
})
