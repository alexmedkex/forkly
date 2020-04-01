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
@Tags('health')
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
    const connections = await Promise.all([CheckerInstance.checkMongoDB(DataAccess.connection.readyState)])

    const [mongo] = connections

    const someDisconnected = connections.some((connection: ICheckedStatus) => !connection.connected)
    if (someDisconnected) {
      throw {
        thrown: true,
        status: 500,
        response: {
          mongo: mongo.error || 'OK'
        }
      }
    }

    return {
      mongo: 'OK'
    }
  }
}
