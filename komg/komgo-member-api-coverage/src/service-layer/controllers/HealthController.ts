import DataAccess from '@komgo/data-access'
import { ICheckedStatus, CheckerInstance } from '@komgo/health-check'
import { Controller, Get, Route, Tags } from 'tsoa'

import { provideSingleton } from '../../inversify/ioc'
import { IHealthResponse } from '../responses/health'

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
  /**
   * @summary health check
   */
  @Get('healthz')
  public async Healthz(): Promise<void> {
    return
  }

  /**
   * @summary health check
   */
  @Get('ready')
  public async Ready(): Promise<IHealthResponse> {
    const connections = await Promise.all([
      CheckerInstance.checkMongoDB(DataAccess.connection.readyState),
      CheckerInstance.checkService(process.env.API_NOTIF_BASE_URL),
      CheckerInstance.checkService(process.env.API_REGISTRY_BASE_URL),
      CheckerInstance.checkRabbitMQ(
        process.env.INTERNAL_MQ_HOST,
        process.env.INTERNAL_MQ_USERNAME,
        process.env.INTERNAL_MQ_PASSWORD
      )
    ])

    const [mongo, apiNotif, apiRegistry, rabbitMQ] = connections

    const someDisconnected = connections.some((connection: ICheckedStatus) => !connection.connected)
    if (someDisconnected) {
      throw {
        thrown: true,
        status: 500,
        response: {
          mongo: mongo.error || 'OK',
          'api-notif': apiNotif.error || 'OK',
          'api-registry': apiRegistry.error || 'OK',
          rabbitMQ: rabbitMQ.error || 'OK'
        }
      }
    }

    return {
      mongo: 'OK',
      'api-notif': 'OK',
      'api-registry': 'OK',
      rabbitMQ: 'OK'
    }
  }
}
