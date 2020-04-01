import { DataAccess } from '@komgo/data-access'
import { Checker, ICheckedStatus } from '@komgo/health-check'
import { inject } from 'inversify'
import { Controller, Get, Route, Tags, Response } from 'tsoa'
import Web3 from 'web3'

import { provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { INJECTED_VALUES } from '../../inversify/values'
import { IHealthResponse } from '../responses/health'
import { HttpException } from '@komgo/microservice-config'

/**
 * Health checks
 */
@Tags('Health')
@Route('')
@provideSingleton(HealthController)
export class HealthController extends Controller {
  constructor(
    @inject(INJECTED_VALUES.Web3Instance) private readonly web3: Web3 | any,
    @inject(TYPES.DataAccess) private readonly dataAccess: DataAccess,
    @inject(TYPES.HealthChecker) private readonly checker: Checker
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
  @Response<HttpException>('500', 'At least one of the dependencies cannot be accessed')
  @Get('ready')
  public async Ready(): Promise<IHealthResponse> {
    const connections = await Promise.all([
      this.checker.checkMongoDB(this.dataAccess.connection.readyState),
      this.checker.checkBlockchain(this.web3)
    ])

    const [mongo, blockchain] = connections

    const someDisconnected = connections.some((connection: ICheckedStatus) => !connection.connected)
    if (someDisconnected) {
      throw {
        thrown: true,
        status: 500,
        response: {
          mongo: mongo.error || 'OK',
          blockchain: blockchain.error || 'OK'
        }
      }
    }

    return {
      mongo: 'OK',
      blockchain: 'OK'
    }
  }
}
