import DataAccess from '@komgo/data-access'
import { ICheckedStatus, CheckerInstance } from '@komgo/health-check'
import { inject } from 'inversify'
import { Controller, Get, Route, Tags } from 'tsoa'

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
    @inject(TYPES.Web3Instance) private readonly web3Instance,
    @inject(TYPES.ApiRegistryUrl) private readonly apiRegistryUrl: string,
    @inject(TYPES.ApiSignerUrl) private readonly signerUrl: string
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
      CheckerInstance.checkBlockchain(this.web3Instance),
      CheckerInstance.checkService(this.signerUrl),
      CheckerInstance.checkService(this.apiRegistryUrl)
    ])

    const [mongo, blockchain, apiSigner, apiRegistry] = connections

    const someDisconnected = connections.some((connection: ICheckedStatus) => !connection.connected)
    if (someDisconnected) {
      throw {
        status: 500,
        response: {
          mongo: mongo.error || 'OK',
          blockchain: blockchain.error || 'OK',
          apiSigner: apiSigner.error || 'OK',
          apiRegistry: apiRegistry.error || 'OK'
        }
      }
    }

    return {
      mongo: 'OK',
      blockchain: 'OK',
      apiSigner: 'OK',
      apiRegistry: 'OK'
    }
  }
}
