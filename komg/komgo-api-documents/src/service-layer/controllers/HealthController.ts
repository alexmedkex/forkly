import DataAccess from '@komgo/data-access'
import { ICheckedStatus, CheckerInstance } from '@komgo/health-check'
import { inject } from 'inversify'
import { Controller, Get, Route, Tags } from 'tsoa'

import { CONFIG_KEYS } from '../../inversify/config_keys'
import { provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { IApiDocumentsHealthResponse } from '../responses/health'

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
    @inject(TYPES.Web3Instance) private readonly web3Instance,
    @inject(CONFIG_KEYS.ApiRegistryUrl) private readonly apiRegistryUrl: string,
    @inject(CONFIG_KEYS.ApiNotifUrl) private readonly notifUrl: string,
    @inject(CONFIG_KEYS.ApiSignerUrl) private readonly signerUrl: string,
    @inject(CONFIG_KEYS.ApiBlockchainSignerBaseUrl) private readonly blockchainSignerUrl: string,
    @inject(CONFIG_KEYS.ApiUsersUrl) private readonly apiUsersUrl: string
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
  public async Ready(): Promise<IApiDocumentsHealthResponse> {
    const connections = await Promise.all([
      CheckerInstance.checkMongoDB(DataAccess.connection.readyState),
      CheckerInstance.checkBlockchain(this.web3Instance),
      CheckerInstance.checkService(this.notifUrl),
      CheckerInstance.checkService(this.signerUrl),
      CheckerInstance.checkService(this.blockchainSignerUrl),
      CheckerInstance.checkService(this.apiRegistryUrl),
      CheckerInstance.checkService(this.apiUsersUrl),
      CheckerInstance.checkRabbitMQ(
        process.env.INTERNAL_MQ_HOST,
        process.env.INTERNAL_MQ_USERNAME,
        process.env.INTERNAL_MQ_PASSWORD
      )
    ])

    const [mongo, blockchain, apiNotif, apiSigner, apiBlockchainSigner, apiRegistry, apiUsers, rabbitMQ] = connections

    const someDisconnected = connections.some((connection: ICheckedStatus) => !connection.connected)
    if (someDisconnected) {
      throw {
        status: 500,
        response: {
          mongo: mongo.error || 'OK',
          blockchain: blockchain.error || 'OK',
          apiNotif: apiNotif.error || 'OK',
          apiSigner: apiSigner.error || 'OK',
          apiBlockchainSigner: apiBlockchainSigner.error || 'OK',
          apiRegistry: apiRegistry.error || 'OK',
          apiUsers: apiUsers.error || 'OK',
          rabbitMQ: rabbitMQ.error || 'OK'
        }
      }
    }

    return {
      mongo: 'OK',
      blockchain: 'OK',
      apiNotif: 'OK',
      apiSigner: 'OK',
      apiBlockchainSigner: 'OK',
      apiRegistry: 'OK',
      apiUsers: 'OK',
      rabbitMQ: 'OK'
    }
  }
}
