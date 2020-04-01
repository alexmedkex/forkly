import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { MessagingFactory, IConsumerWatchdog, IMessageReceived } from '@komgo/messaging-library'
import { injectable, inject, multiInject } from 'inversify'

import InvalidDataError from '../../business-layer/errors/InvalidDataError'
import { InvalidPayloadProcessingError } from '../../business-layer/errors/InvalidPayloadProcessingError'
import { IMessage } from '../../business-layer/messaging/messages/Message'
import { MessageType } from '../../business-layer/messaging/MessageTypes'
import { IEventProcessorBase } from '../../business-layer/messaging/processor/IEventProcessor'
import { BINDINGS } from '../../inversify/constants'
import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../utils/Constants'

const REDACTED_CONTENT = '[redacted]'

@injectable()
export default class MessageProcessorService {
  private readonly logger = getLogger('MessageProcessorService')
  private readonly consumer: IConsumerWatchdog
  private readonly processors: IEventProcessorBase[] = []

  constructor(
    @inject(BINDINGS.ConsumerId) private readonly consumerId: string,
    @inject(BINDINGS.ConsumeRetryDelay) private readonly consumeRetryDelay: number,
    @inject(BINDINGS.InboundPublisher) private publisherId: string,
    @inject(TYPES.MessagingFactory) private readonly messagingFactory: MessagingFactory,
    @multiInject(TYPES.EventProcessor) processors: IEventProcessorBase[]
  ) {
    this.consumer = this.messagingFactory.createConsumerWatchdog(this.consumerId, this.consumeRetryDelay)
    this.logger.info('Registering %d message processors', processors.length)
    processors.forEach(p => this.addProcessor(p))
  }

  public async start() {
    this.logger.info('Starting service to consume credit lines notifications')
    await this.consumer.listenMultiple(
      this.publisherId,
      Object.values(MessageType),
      async (messageReceived: IMessageReceived) => {
        try {
          this.logger.info('Message received', {
            message: { ...messageReceived, content: REDACTED_CONTENT }
          })
          if (!this.isRoutingKeySupported(messageReceived)) {
            messageReceived.reject()
            return
          }

          const messageType: MessageType = this.getMessageType(messageReceived)
          const processor: IEventProcessorBase = this.processors.find(p =>
            p.shouldProcess(messageReceived.content as IMessage)
          )

          if (processor) {
            await processor.processMessage(messageReceived.content as IMessage)

            messageReceived.ack()
          } else {
            this.logger.error(ErrorCode.ValidationKomgoInboundAMQP, ErrorName.EventProcessorNotFoundFailed, {
              messageId: messageReceived.options.messageId,
              messageType
            })

            messageReceived.reject()
          }
        } catch (error) {
          this.handleError(messageReceived, error)
        }
      }
    )
  }

  public async stop() {
    await this.consumer.close()
  }

  private isRoutingKeySupported(messageReceived: IMessageReceived): boolean {
    const messageType = this.getMessageType(messageReceived)
    if (!messageType) {
      this.logger.error(ErrorCode.ValidationKomgoInboundAMQP, ErrorName.UnsupportedMessageTypeError, {
        messageId: messageReceived.options.messageId
      })
      return false
    }
    return true
  }

  private getMessageType(messageReceived: IMessageReceived): MessageType {
    if (Object.values(MessageType).includes(messageReceived.routingKey)) {
      return messageReceived.routingKey as MessageType
    }
    return undefined
  }

  private addProcessor(processor: IEventProcessorBase): void {
    this.processors.push(processor)
    this.logger.info('Registered events processor for message type', { messageType: processor.messageType })
  }

  private handleError(messageReceived: IMessageReceived, error: Error) {
    if (error instanceof InvalidPayloadProcessingError || error instanceof InvalidDataError) {
      this.logger.error(ErrorCode.ValidationKomgoInboundAMQP, ErrorName.InvalidMessagePayloadError, error.message, {
        message: { ...messageReceived, content: REDACTED_CONTENT }
      })
      messageReceived.reject()
    } else {
      this.logger.error(ErrorCode.ConnectionInternalMQ, ErrorName.MessageProcessFailed, {
        message: { ...messageReceived, content: REDACTED_CONTENT }
      })
      messageReceived.requeue()
    }
  }
}
