import DataAccess from '@komgo/data-access'
import { ICheckedStatus, CheckerInstance } from '@komgo/health-check'
import { inject } from 'inversify'
import { Controller, Get, Route, Tags } from 'tsoa'

import ICommonMessagingService from '../../infrastructure/common-broker/ICommonMessagingService'
import { provideSingleton } from '../../inversify/ioc'
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
  constructor(
    @inject(TYPES.CommonMessagingService) private readonly commonMessagingService: ICommonMessagingService,
    @inject(TYPES.HarborAdminPass) private readonly harborAdminPass: string,
    @inject(TYPES.HarborAdminName) private readonly harborAdminName: string,
    @inject(TYPES.HarborProjectId) private readonly harborProjectId: string,
    @inject(TYPES.HarborUrl) private readonly harborUrl: string,
    @inject(TYPES.ApiUsersBaseUrl) private readonly apiUsersBaseUrl: string,
    @inject(TYPES.ApiRegistryBaseUrl) private readonly apiRegistryBaseUrl: string
  ) {
    super()
  }

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
      CheckerInstance.checkService(this.apiUsersBaseUrl),
      CheckerInstance.checkService(this.apiRegistryBaseUrl),
      this.checkCommonMsgAgent(),
      CheckerInstance.checkHarbor(this.harborUrl, this.harborProjectId, this.harborAdminName, this.harborAdminPass)
    ])

    const [mongo, apiUsers, apiRegistry, commonMessagingAgent, harbor] = connections

    const someDisconnected = connections.some((connection: ICheckedStatus) => !connection.connected)
    if (someDisconnected) {
      throw {
        status: 500,
        response: {
          mongo: mongo.error || 'OK',
          apiUsers: apiUsers.error || 'OK',
          apiRegistry: apiRegistry.error || 'OK',
          commonMessagingAgent: commonMessagingAgent.error || 'OK',
          harbor: harbor.error || 'OK'
        }
      }
    }

    return {
      mongo: 'OK',
      apiUsers: 'OK',
      apiRegistry: 'OK',
      commonMessagingAgent: 'OK',
      harbor: 'OK'
    }
  }

  private async checkCommonMsgAgent(): Promise<ICheckedStatus> {
    try {
      await this.commonMessagingService.getVhosts()
      return {
        connected: true
      }
    } catch (e) {
      return {
        connected: false,
        error: `${e.message}`
      }
    }
  }
}
