import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'

import MessagingClient from '../../business-layer/transactions/MessagingClient'
import { TYPES } from '../../inversify/types'

import IService from './IService'
import TransactionSendService from './TransactionSendService'

@injectable()
export default class LifecycleManagementService implements IService {
  private logger = getLogger('LifecycleManagementService')
  private services: IService[]

  constructor(
    @inject(TYPES.TransactionSendService) transactionSendService: TransactionSendService,
    @inject(TYPES.MessagingClient) messagingClient: MessagingClient
  ) {
    this.services = [transactionSendService, messagingClient]
  }

  async start() {
    this.logger.info('Starting all services')
    for (const service of this.services) {
      await service.start()
    }
  }

  async stop() {
    this.logger.info('Stopping all services')
    for (const service of this.services) {
      await service.stop()
    }
  }
}
