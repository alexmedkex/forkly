import { HttpException } from '@komgo/microservice-config'
import 'reflect-metadata'

import { IEventsProcessor } from '../../business-layer/cache/IEventsProcessor'
import { IRegistryCacheDataAgent } from '../../data-layer/data-agents/cache/IRegistryCacheDataAgent'
import { IRegistryEventProcessedDataAgent } from '../../data-layer/data-agents/IRegistryEventProcessedDataAgent'
import { CachePopulationStateHolder, PopulationState } from '../cache/CachePopulationStateHolder'
import IService from '../events/IService'
import { PopulateCacheRequest } from '../requests/PopulateCacheRequest'

import { RegistryCacheController } from './RegistryCacheController'

const dataAgentMock: IRegistryCacheDataAgent = {
  clearCache: jest.fn(),
  saveSingleEvent: jest.fn(),
  getMembers: jest.fn(),
  getProducts: jest.fn()
}

const eventService: IService = {
  start: jest.fn(),
  stop: jest.fn()
}

const processResponseStartServiceTrue = {
  serviceStarted: true
}

const processResponseStartServiceFalse = {
  serviceStarted: false
}

const registryEventProcessedDataAgentMock: IRegistryEventProcessedDataAgent = {
  createOrUpdate: jest.fn(),
  getLastEventProcessed: jest.fn()
}

const eventsProcessorMock: IEventsProcessor = {
  processEventsBatch: jest.fn(),
  processEvent: jest.fn(),
  getDeployedContracts: jest.fn()
}

const komgoProducts = [
  {
    productName: 'Kyc',
    productId: 'KYC'
  },
  {
    productName: 'Letter Of Credit',
    productId: 'LC'
  }
]

const validGetMembersReturnValue = [
  {
    node: 'test',
    parentNode: 'test',
    label: 'test',
    owner: 'test',
    resolver: 'test',
    address: 'test',
    komgoProducts
  },
  {
    node: 'test',
    parentNode: 'test',
    label: 'test',
    owner: 'test',
    resolver: 'test',
    address: 'test',
    komgoProducts
  }
]

describe('RegistryCacheController Test', () => {
  let controller: RegistryCacheController
  let cachePopulationStateHolder: CachePopulationStateHolder

  beforeEach(() => {
    cachePopulationStateHolder = new CachePopulationStateHolder()
    cachePopulationStateHolder.setState(PopulationState.Complete)
    controller = new RegistryCacheController(
      eventsProcessorMock,
      dataAgentMock,
      registryEventProcessedDataAgentMock,
      eventService,
      cachePopulationStateHolder
    )
  })

  describe('getMembers', () => {
    it('should return member data from the cache.', async () => {
      dataAgentMock.getMembers.mockImplementation(() => validGetMembersReturnValue)
      const data = await controller.getMembers('{}')
      expect(data).toEqual(validGetMembersReturnValue)
    })

    it('should return member data from the cache - querystring provided', async () => {
      dataAgentMock.getMembers.mockImplementation(() => validGetMembersReturnValue)
      const data = await controller.getMembers(
        JSON.stringify({
          node: {
            $in: ['123', '1234']
          },
          staticId: {
            $in: ['123', '1234']
          }
        })
      )
      expect(data).toEqual(validGetMembersReturnValue)
    })

    it('should throw error - filter operator is not allowed', async () => {
      const filter = {
        node: {
          $where: { a: 'a' }
        }
      }
      dataAgentMock.getMembers.mockImplementation(() => validGetMembersReturnValue)
      await expect(controller.getMembers(JSON.stringify(filter))).rejects.toMatchObject({
        message: 'Field [node] has unallowed operator [$where]'
      })
    })

    it('should throw error - filter operator content is not valid', async () => {
      const filter = {
        node: {
          $in: { a: 'a' }
        }
      }
      dataAgentMock.getMembers.mockImplementation(() => validGetMembersReturnValue)
      await expect(controller.getMembers(JSON.stringify(filter))).rejects.toMatchObject({
        message: `Field [node] with operator [$in] has wrong value [${JSON.stringify(filter.node.$in)}]`
      })
    })

    it('should throw error - filter operator has extra fields', async () => {
      const filter = {
        node: {
          $in: ['op']
        },
        field: 'field'
      }
      dataAgentMock.getMembers.mockImplementation(() => validGetMembersReturnValue)
      await expect(controller.getMembers(JSON.stringify(filter))).rejects.toMatchObject({
        errorObject: {
          errorCode: 'EVAL01',
          fields: { field: ['property field should not exist'] }
        },
        message: 'Filter querystring in not valid'
      })
    })

    it('should throw if data agent throws an error.', async () => {
      dataAgentMock.getMembers.mockImplementation(() => {
        throw new Error()
      })
      let error
      try {
        const data = await controller.getMembers('test')
      } catch (e) {
        error = e
      }
      expect(error).toBeInstanceOf(HttpException)
    })

    it('should throw error - if population state is Intialised', async () => {
      cachePopulationStateHolder.setState(PopulationState.Initialised)
      dataAgentMock.getMembers.mockImplementation(() => validGetMembersReturnValue)

      await expect(controller.getMembers('{}')).rejects.toMatchObject({
        status: 503
      })
    })

    it('should throw error - if population state is InProgress', async () => {
      cachePopulationStateHolder.setState(PopulationState.InProgress)
      dataAgentMock.getMembers.mockImplementation(() => validGetMembersReturnValue)

      await expect(controller.getMembers('{}')).rejects.toMatchObject({
        status: 503
      })
    })
  })

  describe('getProductAvailability', () => {
    it('should return proper status for product that does exist', async () => {
      dataAgentMock.getProducts.mockImplementation(() => komgoProducts)
      const data = await controller.getProductAvailability('someStaticId', 'KYC')
      expect(data).toEqual({ isAvailable: true })
    })

    it('should return proper status for product that does not exist', async () => {
      dataAgentMock.getProducts.mockImplementation(() => komgoProducts)
      const data = await controller.getProductAvailability('someStaticId', 'WTF')
      expect(data).toEqual({ isAvailable: false })
    })

    it('should throw if data agent throws an error', async () => {
      dataAgentMock.getProducts.mockRejectedValue(new Error())

      await expect(controller.getProductAvailability('someStaticId', 'KYC')).rejects.toMatchObject({
        status: 500
      })
    })

    it('should throw error - if population state is Intialised', async () => {
      cachePopulationStateHolder.setState(PopulationState.Initialised)
      dataAgentMock.getProducts.mockImplementation(() => komgoProducts)

      await expect(controller.getProductAvailability('someStaticId', 'KYC')).rejects.toMatchObject({
        status: 503
      })
    })

    it('should throw error - if population state is InProgress', async () => {
      cachePopulationStateHolder.setState(PopulationState.InProgress)
      dataAgentMock.getProducts.mockImplementation(() => komgoProducts)

      await expect(controller.getProductAvailability('someStaticId', 'KYC')).rejects.toMatchObject({
        status: 503
      })
    })
  })

  const eventsProcessor: IEventsProcessor = {
    processEventsBatch: jest.fn(),
    getDeployedContracts: jest.fn(),
    processEvent: jest.fn()
  }

  const request: PopulateCacheRequest = { from: 1, to: 100 }

  describe('Handling request to clear and populate the registry cache', () => {
    it('should call event processor', async () => {
      eventsProcessorMock.processEventsBatch.mockImplementation(() => processResponseStartServiceFalse)
      await controller.populate(request)
      expect(eventsProcessorMock.processEventsBatch).toHaveBeenCalledTimes(1)
      expect(eventService.start).toHaveBeenCalledTimes(0)
    })

    it('should call event processor and start service', async () => {
      eventsProcessorMock.processEventsBatch.mockImplementation(() => processResponseStartServiceTrue)
      await controller.populate(request)
      expect(eventsProcessorMock.processEventsBatch).toHaveBeenCalledTimes(1)
      expect(eventService.start).toHaveBeenCalledTimes(1)
    })

    it('should throw if error', async () => {
      eventsProcessor.processEventsBatch.mockImplementation(() => {
        throw new Error()
      })
      const result = controller.populate(request)
      await result.catch(error => {
        expect(error).toBeInstanceOf(HttpException)
      })
    })
  })

  describe('Clear cache', () => {
    it('clear cache', async () => {
      await controller.clear()
      expect(dataAgentMock.clearCache).toHaveBeenCalledTimes(1)
    })

    it('clear cache, if error throws', async () => {
      dataAgentMock.clearCache.mockImplementation(() => {
        throw new Error()
      })
      const result = controller.clear()
      await result.catch(error => {
        expect(error).toBeInstanceOf(HttpException)
      })
    })
  })

  describe('Get last event processed', () => {
    it('last event successful', async () => {
      await controller.getLastProcessedEvent()
      expect(registryEventProcessedDataAgentMock.getLastEventProcessed).toHaveBeenCalledTimes(1)
    })

    it('last event if error throws', async () => {
      registryEventProcessedDataAgentMock.getLastEventProcessed.mockImplementation(() => {
        throw new Error()
      })
      const result = controller.getLastProcessedEvent()
      await result.catch(error => {
        expect(error).toBeInstanceOf(HttpException)
      })
    })
  })

  describe('Start service', () => {
    it('start service successful', async () => {
      await controller.startCacheEventService()
      expect(eventService.start).toHaveBeenCalledTimes(1)
    })

    it('start service if error throws', async () => {
      eventService.start.mockImplementation(() => {
        throw new Error()
      })
      const result = controller.startCacheEventService()
      await result.catch(error => {
        expect(error).toBeInstanceOf(HttpException)
      })
    })
  })
})
