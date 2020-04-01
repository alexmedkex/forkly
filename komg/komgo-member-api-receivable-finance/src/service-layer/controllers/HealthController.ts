import { DataAccess } from '@komgo/data-access'
import { Checker, ICheckedStatus } from '@komgo/health-check'
import { inject } from 'inversify'
import { Controller, Get, Route, Tags } from 'tsoa'

import { provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { VALUES } from '../../inversify/values'
import { IHealthResponse } from '../responses'

/**
 * Health check Class
 * @export
 * @class HealthController
 * @extends {Controller}
 */
@Tags('Health')
@Route('')
@provideSingleton(HealthController)
export class HealthController extends Controller {
  constructor(
    @inject(TYPES.DataAccess) private readonly dataAccess: DataAccess,
    @inject(TYPES.HealthChecker) private readonly checker: Checker,
    @inject(VALUES.ApiRFPBaseURL) private readonly apiRFPBaseURL: string,
    @inject(VALUES.ApiRegistryBaseURL) private readonly apiRegistryBaseURL: string,
    @inject(VALUES.ApiTradeCargoBaseURL) private readonly apiTradeCargoBaseURL: string,
    @inject(VALUES.ApiNotifBaseURL) private readonly apiNotifBaseURL: string
  ) {
    super()
  }

  /**
   * Shallow health check that does not check any dependencies
   */
  @Get('healthz')
  public async Healthz(): Promise<void> {
    return
  }

  /**
   * Deep health check that checks dependencies of this service
   */
  @Get('ready')
  public async Ready(): Promise<IHealthResponse> {
    const connections = await Promise.all([
      this.checker.checkMongoDB(this.dataAccess.connection.readyState),
      this.checker.checkRabbitMQ(
        process.env.INTERNAL_MQ_HOST,
        process.env.INTERNAL_MQ_USERNAME,
        process.env.INTERNAL_MQ_PASSWORD
      ),
      this.checker.checkService(this.apiRFPBaseURL),
      this.checker.checkService(this.apiRegistryBaseURL),
      this.checker.checkService(this.apiTradeCargoBaseURL),
      this.checker.checkService(this.apiNotifBaseURL)
    ])
    const [mongo, rabbitMQ, apiRFP, apiRegistry, apiTradeCargo, apiNotif] = connections

    const someDisconnected = connections.some((connection: ICheckedStatus) => !connection.connected)
    if (someDisconnected) {
      throw {
        thrown: true,
        status: 500,
        response: {
          mongo: mongo.error || 'OK',
          rabbitMQ: rabbitMQ.error || 'OK',
          apiRFP: apiRFP.error || 'OK',
          apiRegistry: apiRegistry.error || 'OK',
          apiTradeCargo: apiTradeCargo.error || 'OK',
          apiNotif: apiNotif.error || 'OK'
        }
      }
    }

    return {
      mongo: 'OK',
      rabbitMQ: 'OK',
      apiRFP: 'OK',
      apiRegistry: 'OK',
      apiTradeCargo: 'OK',
      apiNotif: 'OK'
    }
  }
}
