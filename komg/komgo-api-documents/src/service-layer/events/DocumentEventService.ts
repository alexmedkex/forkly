import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IMessageReceived } from '@komgo/messaging-library'
import { inject, injectable, multiInject } from 'inversify'

import InvalidMessage from '../../business-layer/messaging/event-processors/InvalidMessage'
import { EventsRouter } from '../../business-layer/messaging/EventsRouter'
import { RabbitMQConsumingClient } from '../../business-layer/messaging/RabbitMQConsumingClient'
import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../utils/ErrorName'

import IService from './IService'

@injectable()
export default class DocumentEventService implements IService {
  private readonly logger = getLogger('DocumentEventService')

  constructor(
    @multiInject(TYPES.RabbitMQConsumingClient) private readonly consumingClients: RabbitMQConsumingClient[],
    @inject(TYPES.EventsRouter) private readonly eventsRouter: EventsRouter
  ) {}

  async start() {
    this.logger.info('Starting DocumentEventService')
    this.consumingClients.forEach(consumingClient => {
      // Call asynchronously. Messages are processed in the background
      consumingClient.consumeMessages(async message => {
        await this.consumeMessage(message)
      })
    })
  }

  async stop() {
    this.logger.info('Stopping DocumentEventService')
    this.consumingClients.forEach(async consumingClient => {
      this.logger.info('Closing a consumer for publisher id: %s', consumingClient.publisherId)
      try {
        await consumingClient.close()
      } catch (e) {
        this.logger.error(
          ErrorCode.ConnectionInternalMQ,
          ErrorName.MQCloseConnectionError,
          'Unable to close connection to Internal-MQ',
          { errorMessage: e.message }
        )
      }
    })
  }

  private async consumeMessage(message: IMessageReceived): Promise<void> {
    this.logger.info('Processing message: %s; id: %s', message.routingKey, message.options.messageId)

    try {
      await this.processMessage(message)
    } catch (error) {
      this.processError(message, error)
    }
  }

  private async processMessage(message: IMessageReceived): Promise<void> {
    const eventName: string = message.routingKey
    const eventData: object = message.content
    const senderStaticId: string = message.options.senderStaticId

    await this.eventsRouter.processEvent(senderStaticId, eventData, eventName)
    this.logger.info('Message processed. Type: %s; message id: %s', eventName, message.options.messageId)
    message.ack()
  }

  private processError(message: IMessageReceived, error: any): void {
    const eventName: string = message.routingKey
    const messageId: string = message.options.messageId

    this.logger.error(ErrorCode.ValidationInternalAMQP, ErrorName.ProcessMessageError, 'Error processing message', {
      type: message.routingKey,
      messageId: message.options.messageId,
      errorMessage: error.message
    })

    if (error instanceof InvalidMessage) {
      message.reject()
      this.logger.error(
        ErrorCode.ValidationInternalAMQP,
        ErrorName.RejectMessageError,
        'RabbitMQ message was rejected',
        {
          type: eventName,
          messageId
        }
      )
    } else {
      // TODO: This would requeue a message to the *beginning* of the queue if
      // the problem with this message persists, this can block other messages from
      // being processed.
      // We should implement a more sophisticated retry mechanism that requeues a message
      // to the end of the queue and stores information about a retry, e.g., number
      // of retries
      //
      // Recommended retry strategies:
      // * https://medium.com/ibm-watson-data-lab/handling-failure-successfully-in-rabbitmq-22ffa982b60f
      // * https://m.alphasights.com/exponential-backoff-with-rabbitmq-78386b9bec81
      message.requeue()
      this.logger.info('Message requeued. Type: %s; message id: %s', eventName, messageId)
    }
  }
}
