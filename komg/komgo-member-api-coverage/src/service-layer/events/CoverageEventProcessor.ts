import IService from './IService'
import { getLogger } from '@komgo/logging'

import { TYPES } from '../../inversify/types'
import { IMessageReceived, IConsumerWatchdog } from '@komgo/messaging-library'
import { inject, injectable } from 'inversify'
import { MESSAGE_TYPE } from '../../business-layer/messaging/MessageTypes'
import IEventsProcessor from '../../business-layer/messaging/event/IEventsProcessor'
import { ConsumerWatchdogFactory } from '../../business-layer/messaging/ConsumerWatchdogFactory'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../utils/Constants'

@injectable()
export class CoverageEventProcessor implements IService {
  private readonly consumerWatchdog: IConsumerWatchdog
  private readonly logger = getLogger('CoverageEventProcessor')

  constructor(
    @inject(TYPES.ConsumerWatchdogFactory) watchdogFactory: ConsumerWatchdogFactory,
    @inject(TYPES.EventsProcessor) private readonly eventsProcessor: IEventsProcessor,
    @inject('inbound-publisher') private publisherId: string
  ) {
    this.consumerWatchdog = watchdogFactory.create()
  }

  async start() {
    this.logger.info('CoverageEventProcessor Service started')
    return this.consumerWatchdog.listenMultiple(
      this.publisherId,
      [MESSAGE_TYPE.ConnectRequest, MESSAGE_TYPE.ApproveConnectRequest, MESSAGE_TYPE.RejectConnectRequest],
      (event: IMessageReceived) => this.consumeMessage(event)
    )
  }

  async stop() {
    this.logger.info('CoverageEventProcessor Service stopped')
    try {
      await this.consumerWatchdog.close()
    } catch (e) {
      this.logger.error(ErrorCode.ConnectionInternalMQ, ErrorName.ClosingConnectionToInternalMqFailed)
    }
  }

  private async consumeMessage(message: IMessageReceived) {
    this.logger.info('Processing message.', { routingKey: message.routingKey, messageId: message.options.messageId })
    const eventName: string = message.routingKey
    const eventData: object = message.content

    try {
      await this.eventsProcessor.processEvent(eventName, eventData)
      this.logger.info('Message processed.', { type: eventName, messageId: message.options.messageId })
      message.ack()
    } catch (error) {
      this.logger.error(ErrorCode.ValidationInternalAMQP, ErrorName.ProcessingCoverageMessageFailed, {
        type: eventName,
        routingKey: message.routingKey,
        messageId: message.options.messageId,
        error
      })

      message.reject()
    }
  }
}
