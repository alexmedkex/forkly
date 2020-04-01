import { validateMongoFilter } from '@komgo/data-access'
import { getLogger } from '@komgo/logging'
import { ICompany } from '@komgo/types'
import { Route, Body, Get, Controller, Post, Delete, Query, Security } from 'tsoa'

import { IEventsProcessor } from '../../business-layer/cache/IEventsProcessor'
import { IRegistryCacheDataAgent } from '../../data-layer/data-agents/cache/IRegistryCacheDataAgent'
import { IRegistryEventProcessedDataAgent } from '../../data-layer/data-agents/IRegistryEventProcessedDataAgent'
import CacheNotReadyException from '../../exceptions/CacheNotReadyException'
import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { Metric, RegistryCacheControllerEndpoints } from '../../utils/Metrics'
import { PopulationState, CachePopulationStateHolder } from '../cache/CachePopulationStateHolder'
import { generateHttpException } from '../ErrorHandling'
import IService from '../events/IService'
import { CompanyDataRequest } from '../requests/CompanyDataRequest'
import { PopulateCacheRequest } from '../requests/PopulateCacheRequest'
import IProductAvailability from '../responses/IProductAvailability'
import IRegistryCachePopulateResponse from '../responses/IRegistryCachePopulateResponse'

@Route('registry/cache')
@provideSingleton(RegistryCacheController)
export class RegistryCacheController extends Controller {
  private eventsProcessor: IEventsProcessor
  private agent: IRegistryCacheDataAgent
  private cacheEventService: IService
  private registryEventProcessedDataAgent: IRegistryEventProcessedDataAgent
  private readonly logger = getLogger('RegistryCacheController')

  constructor(
    @inject(TYPES.EventsProcessor) private evProcessor: IEventsProcessor,
    @inject(TYPES.RegistryCacheDataAgent) private dataAgent: IRegistryCacheDataAgent,
    @inject(TYPES.RegistryEventProcessedDataAgent) private eventsAgent: IRegistryEventProcessedDataAgent,
    @inject(TYPES.CacheEventService) eventService: IService,
    @inject(TYPES.CachePopulationStateHolder) private readonly cachePopulationStateHolder: CachePopulationStateHolder
  ) {
    super()
    this.eventsProcessor = evProcessor
    this.agent = dataAgent
    this.cacheEventService = eventService
    this.registryEventProcessedDataAgent = eventsAgent
  }

  @Security('internal')
  @Post()
  public async populate(@Body() populateCacheRequest: PopulateCacheRequest): Promise<IRegistryCachePopulateResponse> {
    this.logger.metric({
      [Metric.APICallReceived]: RegistryCacheControllerEndpoints.Populate
    })
    try {
      const response = await this.eventsProcessor.processEventsBatch(populateCacheRequest.from, populateCacheRequest.to)
      if (response.serviceStarted) {
        await this.cacheEventService.start()
      }
      this.logger.metric({
        [Metric.APICallFinished]: RegistryCacheControllerEndpoints.Populate
      })
      return response
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('internal')
  @Post('service')
  public async startCacheEventService() {
    this.logger.metric({
      [Metric.APICallReceived]: RegistryCacheControllerEndpoints.StartCacheEventService
    })
    try {
      await this.cacheEventService.start()
      this.logger.metric({
        [Metric.APICallFinished]: RegistryCacheControllerEndpoints.StartCacheEventService
      })
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('internal')
  @Get('lastevent')
  public async getLastProcessedEvent() {
    this.logger.metric({
      [Metric.APICallReceived]: RegistryCacheControllerEndpoints.GetLastProcessedEvent
    })
    try {
      const event = await this.registryEventProcessedDataAgent.getLastEventProcessed()
      this.logger.metric({
        [Metric.APICallFinished]: RegistryCacheControllerEndpoints.GetLastProcessedEvent
      })
      return event
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('signedIn')
  @Get()
  public async getMembers(@Query('companyData') companyDataRequest: string): Promise<ICompany[]> {
    this.logger.metric({
      [Metric.APICallReceived]: RegistryCacheControllerEndpoints.GetMembers
    })
    try {
      this.validateCachePopulationComplete()
      const companyDataObject = JSON.parse(companyDataRequest)

      await validateMongoFilter(companyDataObject, CompanyDataRequest, { node: ['$in'], staticId: ['$in'] })

      const members = await this.dataAgent.getMembers(companyDataRequest)
      this.logger.metric({
        [Metric.APICallFinished]: RegistryCacheControllerEndpoints.GetMembers
      })
      return members
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('internal')
  @Delete()
  public async clear() {
    this.logger.metric({
      [Metric.APICallReceived]: RegistryCacheControllerEndpoints.Clear
    })
    try {
      await this.agent.clearCache()
      this.logger.metric({
        [Metric.APICallFinished]: RegistryCacheControllerEndpoints.Clear
      })
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('internal')
  @Get('{staticId}/products/{productId}')
  public async getProductAvailability(staticId: string, productId: string): Promise<IProductAvailability> {
    this.logger.metric({
      [Metric.APICallReceived]: RegistryCacheControllerEndpoints.GetProductAvailability
    })
    try {
      this.validateCachePopulationComplete()
      const query = JSON.stringify({ staticId })
      const products = await this.dataAgent.getProducts(query)
      for (const product of products) {
        if (product.productId === productId) {
          this.logger.metric({
            [Metric.APICallFinished]: RegistryCacheControllerEndpoints.GetProductAvailability
          })
          return { isAvailable: true }
        }
      }
      return { isAvailable: false }
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  private validateCachePopulationComplete() {
    if (!this.cachePopulationStateHolder.isComplete()) {
      throw new CacheNotReadyException(`Registry cache population is incomplete`)
    }
  }
}
