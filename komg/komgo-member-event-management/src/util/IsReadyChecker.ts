import DataAccess from '@komgo/data-access'
import { ErrorCode } from '@komgo/error-utilities'
import { ICheckedStatus, CheckerInstance } from '@komgo/health-check'
import logger from '@komgo/logging'
import { inject, injectable } from 'inversify'

import { TYPES } from '../inversify/types'
import ICommonMessagingAgent from '../messaging-layer/ICommonMessagingAgent'

import { ErrorName } from './ErrorName'
import IIsReadyChecker from './IIsReadyChecker'

@injectable()
export default class IsReadyChecker implements IIsReadyChecker {
  private commonMessagingAgent: ICommonMessagingAgent

  constructor(@inject(TYPES.CommonMessagingAgent) commonAgent: ICommonMessagingAgent | any) {
    this.commonMessagingAgent = commonAgent
  }

  public async status(): Promise<{ isReady: boolean; details: {} }> {
    const connections = await Promise.all([
      CheckerInstance.checkMongoDB(DataAccess.connection.readyState),
      this.checkCommonMsgAgent(),
      CheckerInstance.checkRabbitMQ(
        process.env.INTERNAL_MQ_HOST,
        process.env.INTERNAL_MQ_USERNAME,
        process.env.INTERNAL_MQ_PASSWORD
      ),
      CheckerInstance.checkService(process.env.API_SIGNER_BASE_URL)
    ])

    const serviceNames = ['mongo', 'commonMessagingAgent', 'internalMQ', 'apiSigner']
    const details = {}
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

  private async checkCommonMsgAgent(): Promise<ICheckedStatus> {
    try {
      await this.commonMessagingAgent.getVhosts()
      return {
        connected: true
      }
    } catch (e) {
      return {
        connected: false,
        error: `${e}`
      }
    }
  }
}
