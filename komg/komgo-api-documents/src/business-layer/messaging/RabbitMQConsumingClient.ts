import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ConsumerWatchdog } from '@komgo/messaging-library'
import { injectable } from 'inversify'

import { ErrorName } from '../../utils/ErrorName'

import { ConsumerWatchdogFactory } from './ConsumerWatchdogFactory'

@injectable()
export class RabbitMQConsumingClient {
  private readonly logger = getLogger('RabbitMQConsumingClient')
  private readonly consumerWatchdog: ConsumerWatchdog

  constructor(
    public readonly publisherId: string,
    public readonly routingKeys: string[],
    watchdogFactory: ConsumerWatchdogFactory
  ) {
    this.logger.info('Creating a RabbitMQ messages consumer watchdog')
    this.consumerWatchdog = watchdogFactory.create()
  }

  async consumeMessages(f: (IMessageReceived) => Promise<void>): Promise<void> {
    this.logger.info('Processing RabbitMQ messages', {
      publisherId: this.publisherId,
      routingKeys: this.routingKeys
    })
    this.consumerWatchdog.listenMultiple(this.publisherId, this.routingKeys, f)
  }

  async close(): Promise<void> {
    try {
      await this.consumerWatchdog.close()
    } catch (e) {
      this.logger.error(
        ErrorCode.ConnectionInternalMQ,
        ErrorName.MQCloseConnectionError,
        'Failed to close consumer watchdog',
        { errorMessage: e.message }
      )
    }
  }
}
