import { getLogger } from '@komgo/logging'
import { ConsumerWatchdog, MessagingFactory } from '@komgo/messaging-library'
import { inject, injectable } from 'inversify'

import { CONFIG_KEYS } from '../../inversify/config_keys'
import { TYPES } from '../../inversify/types'

const ONE_SECOND = 1000
const RETRY_IN_SECONDS = 10
const RETRY_DELAY = RETRY_IN_SECONDS * ONE_SECOND

@injectable()
export class ConsumerWatchdogFactory {
  private readonly logger = getLogger('ConsumerWatchdogFactory')

  constructor(
    @inject(CONFIG_KEYS.ConsumerId) private readonly consumerId: string,
    @inject(TYPES.MessagingFactory) private readonly messagingFactory: MessagingFactory
  ) {
    this.logger.info('Creating a RabbitMQ messages consumer')
  }

  create() {
    const consumer = this.messagingFactory.createConsumer(this.consumerId)
    return new ConsumerWatchdog(consumer, RETRY_DELAY)
  }
}
