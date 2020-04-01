import DataAccess from '@komgo/data-access'
import { ICheckedStatus, CheckerInstance } from '@komgo/health-check'
import { getLogger } from '@komgo/logging'
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
  private readonly logger = getLogger('HealthController')

  constructor(
    @inject(TYPES.Web3) private readonly web3Instance,
    @inject('api-blockchain-signer-url') private readonly blockchainSignerUrl: string,
    @inject('api-signer-url') private readonly signerUrl: string
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
      CheckerInstance.checkRabbitMQ(
        process.env.INTERNAL_MQ_HOST,
        process.env.INTERNAL_MQ_USERNAME,
        process.env.INTERNAL_MQ_PASSWORD
      ),
      CheckerInstance.checkService(this.signerUrl),
      CheckerInstance.checkService(this.blockchainSignerUrl)
    ])

    const [mongo, blockchain, rabbitMQ, signer, blockchainSigner] = connections

    const someDisconnected = connections.some((connection: ICheckedStatus) => !connection.connected)
    if (someDisconnected) {
      throw {
        thrown: true,
        status: 500,
        response: {
          mongo: mongo.error || 'OK',
          blockchain: blockchain.error || 'OK',
          rabbitMQ: rabbitMQ.error || 'OK',
          signer: signer.error || 'OK',
          blockchainSigner: blockchainSigner.error || 'OK'
        }
      }
    }
    return {
      mongo: 'OK',
      blockchain: 'OK',
      rabbitMQ: 'OK',
      signer: 'OK',
      blockchainSigner: 'OK'
    }
  }
}
