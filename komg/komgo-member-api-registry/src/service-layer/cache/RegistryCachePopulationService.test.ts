import 'reflect-metadata'
import Web3 from 'web3'

import { IEventsProcessor } from '../../business-layer/cache/IEventsProcessor'
import { IRegistryCacheDataAgent } from '../../data-layer/data-agents/cache/IRegistryCacheDataAgent'
import IService from '../events/IService'

import { CachePopulationStateHolder } from './CachePopulationStateHolder'
import IRegistryCachePopulationService from './IRegistryCachePopulationService'
import { RegistryCachePopulationService } from './RegistryCachePopulationService'

const eventsProcessorMock: IEventsProcessor = {
  getDeployedContracts: jest.fn(),
  processEvent: jest.fn(),
  processEventsBatch: jest.fn()
}

const registryDataAgentMock: IRegistryCacheDataAgent = {
  clearCache: jest.fn(),
  getMembers: jest.fn(),
  saveSingleEvent: jest.fn(),
  getProducts: jest.fn()
}

const cacheEventServiceMock: IService = {
  start: jest.fn(),
  stop: jest.fn()
}

const web3mock: Web3 = {
  eth: {
    getBlockNumber: jest.fn(),
    clearSubscriptions: jest.fn(),
    Contract: jest.fn(),
    getAccounts: jest.fn(),
    getBlock: jest.fn(),
    getPastLogs: jest.fn(),
    getTransactionReceipt: jest.fn(),
    sendTransaction: jest.fn(),
    subscribe: jest.fn()
  },
  sha3: jest.fn()
}

const signerClientMock = {
  getRSAKey: jest.fn()
}

const blockchainSignerClientMock = {
  getEthKey: jest.fn()
}

describe('Start RegistryCachePopulationService', () => {
  let registryCachePopulationService: IRegistryCachePopulationService
  const oldIsLmsNode = process.env.IS_LMS_NODE
  const cachePopulationStateHolder = new CachePopulationStateHolder()

  beforeEach(() => {
    process.env.IS_LMS_NODE = 'false'
    registryDataAgentMock.getMembers.mockResolvedValue([
      { ethPubKeys: [{ address: 'string' }], komgoMessagingPubKeys: [{ key: JSON.stringify({ n: 'string' }) }] }
    ])
    blockchainSignerClientMock.getEthKey.mockResolvedValue({ address: 'string' })
    signerClientMock.getRSAKey.mockResolvedValue({ n: 'string' })
    registryCachePopulationService = new RegistryCachePopulationService(
      eventsProcessorMock,
      registryDataAgentMock,
      cacheEventServiceMock,
      web3mock,
      1400,
      'static-id',
      signerClientMock,
      blockchainSignerClientMock,
      cachePopulationStateHolder
    )
  })

  afterEach(() => {
    process.env.IS_LMS_NODE = oldIsLmsNode
  })

  it('check method calls', async () => {
    web3mock.eth.getBlockNumber = jest.fn().mockImplementationOnce(() => 1000)
    await registryCachePopulationService.clearPopulateAndStartService()
    expect(registryDataAgentMock.clearCache).toHaveBeenCalledTimes(1)
    expect(web3mock.eth.getBlockNumber).toHaveBeenCalledTimes(1)
    expect(eventsProcessorMock.processEventsBatch).toHaveBeenCalledTimes(1)
    expect(cacheEventServiceMock.start).toHaveBeenCalledTimes(1)
    expect(cachePopulationStateHolder.isComplete()).toBeTruthy()
  })

  it('check method calls with blockNumber higher than block chunk size', async () => {
    web3mock.eth.getBlockNumber = jest.fn().mockImplementationOnce(() => 2000)
    await registryCachePopulationService.clearPopulateAndStartService()
    expect(registryDataAgentMock.clearCache).toHaveBeenCalledTimes(1)
    expect(web3mock.eth.getBlockNumber).toHaveBeenCalledTimes(1)
    expect(eventsProcessorMock.processEventsBatch).toHaveReturnedTimes(2)
    expect(eventsProcessorMock.processEventsBatch).toHaveBeenNthCalledWith(1, 1, 1400)
    expect(eventsProcessorMock.processEventsBatch).toHaveBeenNthCalledWith(2, 1401, 2000)
    expect(cacheEventServiceMock.start).toHaveBeenCalledTimes(1)
    expect(cachePopulationStateHolder.isComplete()).toBeTruthy()
  })

  it('check method calls with blockNumber higher 1 than block chunk size', async () => {
    web3mock.eth.getBlockNumber = jest.fn().mockImplementationOnce(() => 1401)
    await registryCachePopulationService.clearPopulateAndStartService()
    expect(registryDataAgentMock.clearCache).toHaveBeenCalledTimes(1)
    expect(web3mock.eth.getBlockNumber).toHaveBeenCalledTimes(1)
    expect(eventsProcessorMock.processEventsBatch).toHaveReturnedTimes(2)
    expect(eventsProcessorMock.processEventsBatch).toHaveBeenNthCalledWith(1, 1, 1400)
    expect(eventsProcessorMock.processEventsBatch).toHaveBeenNthCalledWith(2, 1401, 1401)
    expect(cacheEventServiceMock.start).toHaveBeenCalledTimes(1)
    expect(cachePopulationStateHolder.isComplete()).toBeTruthy()
  })

  it('check method calls with blockNumber higher than block chunk size (again)', async () => {
    web3mock.eth.getBlockNumber = jest.fn().mockImplementationOnce(() => 5000)
    await registryCachePopulationService.clearPopulateAndStartService()
    expect(registryDataAgentMock.clearCache).toHaveBeenCalledTimes(1)
    expect(web3mock.eth.getBlockNumber).toHaveBeenCalledTimes(1)
    expect(eventsProcessorMock.processEventsBatch).toHaveReturnedTimes(4)
    expect(eventsProcessorMock.processEventsBatch).toHaveBeenNthCalledWith(1, 1, 1400)
    expect(eventsProcessorMock.processEventsBatch).toHaveBeenNthCalledWith(2, 1401, 2801)
    expect(eventsProcessorMock.processEventsBatch).toHaveBeenNthCalledWith(3, 2802, 4202)
    expect(eventsProcessorMock.processEventsBatch).toHaveBeenNthCalledWith(4, 4203, 5000)
    expect(cacheEventServiceMock.start).toHaveBeenCalledTimes(1)
    expect(cachePopulationStateHolder.isComplete()).toBeTruthy()
  })

  it('check method calls with blockNumber lower than block chunk size', async () => {
    web3mock.eth.getBlockNumber = jest.fn().mockImplementationOnce(() => 1000)
    await registryCachePopulationService.clearPopulateAndStartService()
    expect(registryDataAgentMock.clearCache).toHaveBeenCalledTimes(1)
    expect(web3mock.eth.getBlockNumber).toHaveBeenCalledTimes(1)
    expect(eventsProcessorMock.processEventsBatch).toHaveReturnedTimes(1)
    expect(eventsProcessorMock.processEventsBatch).toHaveBeenNthCalledWith(1, 1, 1000)
    expect(cacheEventServiceMock.start).toHaveBeenCalledTimes(1)
  })

  it('check method calls with blockNumber equals than block chunk size', async () => {
    web3mock.eth.getBlockNumber = jest.fn().mockImplementationOnce(() => 1400)
    await registryCachePopulationService.clearPopulateAndStartService()
    expect(registryDataAgentMock.clearCache).toHaveBeenCalledTimes(1)
    expect(web3mock.eth.getBlockNumber).toHaveBeenCalledTimes(1)
    expect(eventsProcessorMock.processEventsBatch).toHaveReturnedTimes(1)
    expect(eventsProcessorMock.processEventsBatch).toHaveBeenNthCalledWith(1, 1, 1400)
    expect(cacheEventServiceMock.start).toHaveBeenCalledTimes(1)
  })

  it('if clear cache fails, nothing after it is called', async () => {
    web3mock.eth.getBlockNumber = jest.fn().mockImplementationOnce(() => 1000)
    registryDataAgentMock.clearCache.mockImplementationOnce(() => {
      throw new Error()
    })
    await registryCachePopulationService.clearPopulateAndStartService()
    expect(registryDataAgentMock.clearCache).toHaveBeenCalledTimes(1)
    expect(web3mock.eth.getBlockNumber).toHaveBeenCalledTimes(0)
    expect(eventsProcessorMock.processEventsBatch).toHaveBeenCalledTimes(0)
    expect(cacheEventServiceMock.start).toHaveBeenCalledTimes(0)
  })

  it('if blockNumber fails, nothing after it is called', async () => {
    web3mock.eth.getBlockNumber = jest.fn().mockImplementationOnce(() => {
      throw new Error()
    })
    await registryCachePopulationService.clearPopulateAndStartService()
    expect(registryDataAgentMock.clearCache).toHaveBeenCalledTimes(1)
    expect(web3mock.eth.getBlockNumber).toHaveBeenCalledTimes(1)
    expect(eventsProcessorMock.processEventsBatch).toHaveBeenCalledTimes(0)
    expect(cacheEventServiceMock.start).toHaveBeenCalledTimes(0)
  })

  it('if processEventsBatch fails, nothing after it is called', async () => {
    web3mock.eth.getBlockNumber = jest.fn().mockImplementationOnce(() => 1000)
    eventsProcessorMock.processEventsBatch.mockImplementationOnce(() => {
      throw new Error()
    })
    await registryCachePopulationService.clearPopulateAndStartService()
    expect(registryDataAgentMock.clearCache).toHaveBeenCalledTimes(1)
    expect(web3mock.eth.getBlockNumber).toHaveBeenCalledTimes(1)
    expect(eventsProcessorMock.processEventsBatch).toHaveBeenCalledTimes(1)
    expect(cacheEventServiceMock.start).toHaveBeenCalledTimes(0)
  })

  it('if service start fails, called but returns error', async () => {
    web3mock.eth.getBlockNumber = jest.fn().mockImplementationOnce(() => 1000)
    cacheEventServiceMock.start.mockImplementationOnce(() => {
      throw new Error()
    })
    const result = registryCachePopulationService.clearPopulateAndStartService()
    await result.catch(error => {
      expect(error.thrown).toBeTruthy()
    })
    expect(registryDataAgentMock.clearCache).toHaveBeenCalledTimes(1)
    expect(web3mock.eth.getBlockNumber).toHaveBeenCalledTimes(1)
    expect(eventsProcessorMock.processEventsBatch).toHaveBeenCalledTimes(1)
    expect(cacheEventServiceMock.start).toHaveBeenCalledTimes(1)
  })

  it('should fail on eth key mismatch', async () => {
    web3mock.eth.getBlockNumber = jest.fn().mockImplementationOnce(() => 1000)
    registryDataAgentMock.getMembers.mockResolvedValue([{ ethPubKeys: [] }])
    blockchainSignerClientMock.getEthKey.mockResolvedValue({ address: 'string' })

    const result = await registryCachePopulationService.clearPopulateAndStartService()

    expect(registryDataAgentMock.clearCache).toHaveBeenCalledTimes(1)
    expect(web3mock.eth.getBlockNumber).toHaveBeenCalledTimes(1)
    expect(eventsProcessorMock.processEventsBatch).toHaveBeenCalledTimes(1)
    expect(blockchainSignerClientMock.getEthKey).toHaveReturnedTimes(1)
    expect(signerClientMock.getRSAKey).toHaveReturnedTimes(0)
    expect(result).toEqual(false)
  })

  it('should skip eth key verification if IS_LMS_NODE', async () => {
    process.env.IS_LMS_NODE = 'true'
    web3mock.eth.getBlockNumber = jest.fn().mockImplementationOnce(() => 1000)
    registryDataAgentMock.getMembers.mockResolvedValue([{ ethPubKeys: [] }])
    blockchainSignerClientMock.getEthKey.mockResolvedValue({ address: 'string' })

    await registryCachePopulationService.clearPopulateAndStartService()

    expect(signerClientMock.getRSAKey).not.toHaveBeenCalled()
  })

  it('should fail on rsa key mismatch', async () => {
    web3mock.eth.getBlockNumber = jest.fn().mockImplementationOnce(() => 1000)
    registryDataAgentMock.getMembers.mockResolvedValue([
      { ethPubKeys: [{ address: 'string' }], komgoMessagingPubKeys: [] }
    ])
    blockchainSignerClientMock.getEthKey.mockResolvedValue({ address: 'string' })
    signerClientMock.getRSAKey.mockResolvedValue({ n: 'string' })
    const result = await registryCachePopulationService.clearPopulateAndStartService()

    expect(registryDataAgentMock.clearCache).toHaveBeenCalledTimes(1)
    expect(web3mock.eth.getBlockNumber).toHaveBeenCalledTimes(1)
    expect(eventsProcessorMock.processEventsBatch).toHaveBeenCalledTimes(1)
    expect(blockchainSignerClientMock.getEthKey).toHaveReturnedTimes(1)
    expect(signerClientMock.getRSAKey).toHaveReturnedTimes(1)
    expect(result).toEqual(false)
  })

  it('should not throw error on empty string rsa key', async () => {
    web3mock.eth.getBlockNumber = jest.fn().mockImplementationOnce(() => 1000)
    registryDataAgentMock.getMembers.mockResolvedValue([
      {
        ethPubKeys: [{ address: 'string' }],
        komgoMessagingPubKeys: [{ key: JSON.stringify({ n: 'string' }) }, { key: '' }]
      }
    ])
    signerClientMock.getRSAKey.mockResolvedValue({ n: 'string' })
    const result = await registryCachePopulationService.clearPopulateAndStartService()

    expect(registryDataAgentMock.clearCache).toHaveBeenCalledTimes(1)
    expect(web3mock.eth.getBlockNumber).toHaveBeenCalledTimes(1)
    expect(eventsProcessorMock.processEventsBatch).toHaveBeenCalledTimes(1)
    expect(blockchainSignerClientMock.getEthKey).toHaveReturnedTimes(1)
    expect(signerClientMock.getRSAKey).toHaveReturnedTimes(1)
    expect(result).toEqual(true)
  })

  it('should skip rsa key verification if IS_LMS_NODE', async () => {
    process.env.IS_LMS_NODE = 'true'
    web3mock.eth.getBlockNumber = jest.fn().mockImplementationOnce(() => 1000)
    registryDataAgentMock.getMembers.mockResolvedValue([
      { ethPubKeys: [{ address: 'string' }], komgoMessagingPubKeys: [] }
    ])
    blockchainSignerClientMock.getEthKey.mockResolvedValue({ address: 'string' })
    signerClientMock.getRSAKey.mockResolvedValue({ n: 'string' })
    await registryCachePopulationService.clearPopulateAndStartService()

    expect(signerClientMock.getRSAKey).not.toHaveBeenCalled()
  })

  it('should fail if unable to find company by static ID', async () => {
    web3mock.eth.getBlockNumber = jest.fn().mockImplementationOnce(() => 1000)
    registryDataAgentMock.getMembers.mockResolvedValue([])
    const result = await registryCachePopulationService.clearPopulateAndStartService()

    expect(result).toEqual(false)
  })
})
