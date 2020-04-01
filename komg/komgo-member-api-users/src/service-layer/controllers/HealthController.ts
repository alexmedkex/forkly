import DataAccess from '@komgo/data-access'
import { ICheckedStatus, CheckerInstance } from '@komgo/health-check'
import { Controller, Get, Route, Tags } from 'tsoa'

import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
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
  @inject(TYPES.KeycloakAuthUrl)
  private readonly keycloakAuthUrl: string

  /**
   * @summary health check
   */
  @Get('healthz')
  public async Healthz(): Promise<void> {
    return
  }

  /**
   * @summary readiness check
   */
  @Get('ready')
  public async Ready(): Promise<IHealthResponse> {
    const connections = await Promise.all([
      CheckerInstance.checkKeycloak(this.keycloakAuthUrl, process.env.KEYCLOAK_REALM_NAME),
      CheckerInstance.checkService(process.env.API_ROLES_BASE_URL),
      CheckerInstance.checkMongoDB(DataAccess.connection.readyState)
    ])

    const [keycloak, apiRoles, mongo] = connections

    const someDisconnected = connections.some((connection: ICheckedStatus) => !connection.connected)
    if (someDisconnected) {
      throw {
        status: 500,
        response: {
          keycloak: keycloak.error || 'OK',
          apiRoles: apiRoles.error || 'OK',
          mongo: mongo.error || 'OK'
        }
      }
    }

    return {
      keycloak: 'OK',
      apiRoles: 'OK',
      mongo: 'OK'
    }
  }
}
