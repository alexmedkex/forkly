import { MessagingFactory } from '@komgo/messaging-library'
import { inject, injectable } from 'inversify'

import { TYPES } from '../../inversify/types'
import logger from '@komgo/logging'

const ONE_SECOND = 1000
const RETRY_IN_SECONDS = 10
export const RETRY_DELAY = RETRY_IN_SECONDS * ONE_SECOND

@injectable()
export class ConsumerWatchdogFactory {
  constructor(
    @inject('consumer-id') private readonly consumerId: string,
    @inject(TYPES.MessagingFactory) private readonly messagingFactory: MessagingFactory
  ) {
    logger.info('Creating a RabbitMQ messages consumer')
  }

  create() {
    return this.messagingFactory.createConsumerWatchdog(this.consumerId, RETRY_DELAY)
  }
}
