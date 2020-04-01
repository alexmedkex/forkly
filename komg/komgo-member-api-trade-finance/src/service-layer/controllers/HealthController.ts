import DataAccess from '@komgo/data-access'
import { ICheckedStatus, CheckerInstance } from '@komgo/health-check'
import { Web3Wrapper } from '@komgo/blockchain-access'
import { inject } from 'inversify'
import { Controller, Get, Route, Tags } from 'tsoa'

import { provideSingleton } from '../../inversify/ioc'
import { IHealthResponse } from '../responses/health'
import { CONFIG } from '../../inversify/config'

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
    @inject(CONFIG.RegistryUrl) private readonly apiRegistryUrl: string,
    @inject(CONFIG.TradeCargoUrl) private readonly tradeCargoUrl: string,
    @inject(CONFIG.NotifUrl) private readonly notifUrl: string,
    @inject(CONFIG.SignerUrl) private readonly signerUrl: string,
    @inject(CONFIG.DocumentsServiceUrl) private readonly documentsServiceUrl: string
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
      CheckerInstance.checkBlockchain(Web3Wrapper.web3Instance),
      CheckerInstance.checkService(this.notifUrl),
      CheckerInstance.checkService(this.signerUrl),
      CheckerInstance.checkService(this.apiRegistryUrl),
      CheckerInstance.checkService(this.documentsServiceUrl),
      CheckerInstance.checkService(this.tradeCargoUrl),
      CheckerInstance.checkRabbitMQ(
        process.env.INTERNAL_MQ_HOST,
        process.env.INTERNAL_MQ_USERNAME,
        process.env.INTERNAL_MQ_PASSWORD
      )
    ])

    const [mongo, blockchain, apiNotif, apiSigner, apiRegistry, apiDocuments, apiTradeCargo, rabbitMQ] = connections

    const someDisconnected = connections.some((connection: ICheckedStatus) => !connection.connected)
    if (someDisconnected) {
      throw {
        thrown: true,
        status: 500,
        response: {
          mongo: mongo.error || 'OK',
          blockchain: blockchain.error || 'OK',
          rabbitMQ: rabbitMQ.error || 'OK',
          'api-notif': apiNotif.error || 'OK',
          'api-signer': apiSigner.error || 'OK',
          'api-registry': apiRegistry.error || 'OK',
          'api-documents': apiDocuments.error || 'OK',
          'api-trade-cargo': apiTradeCargo.error || 'OK'
        }
      }
    }

    return {
      mongo: 'OK',
      blockchain: 'OK',
      rabbitMQ: 'OK',
      'api-notif': 'OK',
      'api-signer': 'OK',
      'api-registry': 'OK',
      'api-documents': 'OK',
      'api-trade-cargo': 'OK'
    }
  }
}
