import { ICheckedStatus, CheckerInstance } from '@komgo/health-check'
import { Controller, Get, Route, Tags } from 'tsoa'

import { IHealthResponse } from '../response/health'

/**
 * Health check Class
 * @export
 * @class HealthController
 * @extends {Controller}
 */
@Tags('health')
@Route('')
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
      CheckerInstance.checkKeycloak(process.env.KEYCLOAK_SERVER_AUTH_URL, process.env.KEYCLOAK_REALM_NAME),
      CheckerInstance.checkService(process.env.API_ROLES_BASE_URL)
    ])

    const [keycloak, apiRoles] = connections

    const someDisconnected = connections.some((connection: ICheckedStatus) => !connection.connected)
    if (someDisconnected) {
      throw {
        status: 500,
        response: {
          keycloak: keycloak.error || 'OK',
          apiRoles: apiRoles.error || 'OK'
        }
      }
    }

    return {
      keycloak: 'OK',
      apiRoles: 'OK'
    }
  }
}
