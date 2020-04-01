import DataAccess from '@komgo/data-access'
import { ErrorCode } from '@komgo/error-utilities'
import { ICheckedStatus, CheckerInstance } from '@komgo/health-check'
import logger from '@komgo/logging'
import { inject, injectable } from 'inversify'
import Web3 from 'web3'

import { TYPES } from '../inversify/types'
import { VALUES } from '../inversify/values'

import { ErrorName } from './ErrorName'
import IIsReadyChecker, { IReadyStatus } from './IIsReadyChecker'

@injectable()
export default class IsReadyChecker implements IIsReadyChecker {
  constructor(
    @inject(TYPES.Web3Instance) private readonly web3: Web3,
    @inject(VALUES.ApiRegistryBaseURL) private readonly apiRegistryBaseURL: string
  ) {}

  public async status(): Promise<IReadyStatus> {
    const connections = await Promise.all([
      CheckerInstance.checkBlockchain(this.web3),
      CheckerInstance.checkMongoDB(DataAccess.connection.readyState),
      CheckerInstance.checkRabbitMQ(
        process.env.INTERNAL_MQ_HOST,
        process.env.INTERNAL_MQ_USERNAME,
        process.env.INTERNAL_MQ_PASSWORD
      ),
      CheckerInstance.checkService(this.apiRegistryBaseURL)
    ])
    const details = {}
    const serviceNames = ['blockchain', 'mongo', 'internalMQ', 'apiRegistry']
    connections.forEach((connection: ICheckedStatus, index) => {
      details[serviceNames[index]] = connection.connected ? 'OK' : connection.error
      if (connection.connected) {
        logger.info('is-ready check', { [serviceNames[index]]: 'OK' })
      } else {
        logger.warn(ErrorCode.Connection, ErrorName.ReadyCheck, { [serviceNames[index]]: connection.error })
      }
    })

    const someDisconnected = connections.some((connection: ICheckedStatus) => !connection.connected)
    return { isReady: !someDisconnected, details }
  }

  public async isReady(): Promise<boolean> {
    const status = await this.status()
    return status.isReady
  }
}
