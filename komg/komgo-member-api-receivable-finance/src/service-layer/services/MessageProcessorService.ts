import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { MessagingFactory, IConsumerWatchdog, IMessageReceived } from '@komgo/messaging-library'
import { TradeCargoRoutingKey, DocumentRoutingKeyFactory, DocumentRoutingKeyPrefix } from '@komgo/messaging-types'
import { injectable, inject } from 'inversify'

import { InvalidPayloadProcessingError, EntityNotFoundError } from '../../business-layer/errors'
import {
  UPDATE_TYPE_ROUTING_KEY_PREFIX,
  ADD_DISCOUNTING_TYPE_ROUTING_KEY_PREFIX
} from '../../business-layer/messaging/constants'
import { REDACTED_CONTENT, PRODUCT_ID } from '../../constants'
import { ErrorName } from '../../ErrorName'
import { TYPES } from '../../inversify/types'
import { VALUES } from '../../inversify/values'

import { AddDiscountingMessageProcessor } from './AddDiscountingMessageProcessor'
import { DocumentMessageProcessor } from './DocumentMessageProcessor'
import { IMessageProcessor } from './IMessageProcessor'
import { IMessageProcessorRoute } from './IMessageProcessorRoute'
import { RFPMessageProcessor } from './RFPMessageProcessor'
import { TradeCargoMessageProcessor } from './TradeCargoMessageProcessor'
import { UpdateMessageProcessor } from './UpdateMessageProcessor'

const BIND_RFP_ROUTING_KEY = 'INTERNAL.RFP.tradeFinance.rd.#'
const BIND_UPDATE_ROUTING_KEY = `${UPDATE_TYPE_ROUTING_KEY_PREFIX}#`
const BIND_ADD_DISCOUNTING_ROUTING_KEY = `${ADD_DISCOUNTING_TYPE_ROUTING_KEY_PREFIX}#`

@injectable()
export class MessageProcessorService {
  private readonly logger = getLogger('MessageProcessorService')
  private readonly consumer: IConsumerWatchdog

  constructor(
    @inject(VALUES.RFPConsumerId) consumerId: string,
    @inject(VALUES.ConsumeRetryDelay) consumeRetryDelay: number,
    @inject(VALUES.RFPPublisherId) private readonly rfpPublisherId: string,
    @inject(VALUES.TradeCargoPublisherId) private readonly tradeCargoPublisherId: string,
    @inject(VALUES.InboundPublisherId) private readonly inboundPublisherId: string,
    @inject(VALUES.DocumentsPublisherId) private readonly documentsPublisherId: string,
    @inject(TYPES.MessagingFactory) private readonly messagingFactory: MessagingFactory,
    @inject(TYPES.RFPMessageProcessor)
    private readonly rfpMessageProcessor: RFPMessageProcessor,
    @inject(TYPES.UpdateMessageProcessor) private readonly updateMessageProcessor: UpdateMessageProcessor,
    @inject(TYPES.TradeCargoMessageProcessor) private readonly tradeCargoMessageProcessor: TradeCargoMessageProcessor,
    @inject(TYPES.DocumentMessageProcessor) private readonly documentMessageProcessor: DocumentMessageProcessor,
    @inject(TYPES.AddDiscountingMessageProcessor)
    private readonly addDiscountingMessageProcessor: AddDiscountingMessageProcessor
  ) {
    this.consumer = this.messagingFactory.createConsumerWatchdog(consumerId, consumeRetryDelay)
  }

  public async start() {
    this.logger.info('Starting service to consume AMQP messages')

    await this.consumer.listenMultiple(
      this.inboundPublisherId,
      [BIND_UPDATE_ROUTING_KEY, BIND_ADD_DISCOUNTING_ROUTING_KEY],
      this.createProcessorHandlerSwitch([
        { processor: this.updateMessageProcessor, prefix: UPDATE_TYPE_ROUTING_KEY_PREFIX },
        { processor: this.addDiscountingMessageProcessor, prefix: ADD_DISCOUNTING_TYPE_ROUTING_KEY_PREFIX }
      ])
    )

    await this.consumer.listen(
      this.rfpPublisherId,
      BIND_RFP_ROUTING_KEY,
      this.createProcessorHandler(this.rfpMessageProcessor)
    )

    await this.consumer.listen(
      this.documentsPublisherId,
      DocumentRoutingKeyFactory.createForBind(DocumentRoutingKeyPrefix.DocumentReceived, PRODUCT_ID),
      this.createProcessorHandler(this.documentMessageProcessor)
    )

    await this.consumer.listenMultiple(
      this.tradeCargoPublisherId,
      [TradeCargoRoutingKey.TradeUpdated, TradeCargoRoutingKey.CargoUpdated],
      this.createProcessorHandler(this.tradeCargoMessageProcessor)
    )
  }

  public async stop() {
    await this.consumer.close()
  }

  private logMessage(messageReceived: IMessageReceived) {
    this.logger.info('Message received', {
      message: {
        routingKey: messageReceived.routingKey,
        content: REDACTED_CONTENT,
        messageId: messageReceived.options.messageId
      }
    })
  }

  private createProcessorHandlerSwitch(routes: IMessageProcessorRoute[]) {
    return async (messageReceived: IMessageReceived) => {
      const route = routes.find(({ prefix }) => messageReceived.routingKey.startsWith(prefix))
      if (route) {
        try {
          this.logMessage(messageReceived)
          await route.processor.process(messageReceived)
        } catch (error) {
          this.handleError(messageReceived, error)
        }
      } else {
        this.logger.error(ErrorCode.Configuration, ErrorName.RoutingKeyNotRecognized, {
          routingKey: messageReceived.routingKey
        })
        throw new InvalidPayloadProcessingError(
          'Message not handled as routing key does not match any expected routing key'
        )
      }
    }
  }

  private createProcessorHandler(processor: IMessageProcessor) {
    return async (messageReceived: IMessageReceived) => {
      try {
        this.logMessage(messageReceived)
        await processor.process(messageReceived)
      } catch (error) {
        this.handleError(messageReceived, error)
      }
    }
  }

  private handleError(messageReceived: IMessageReceived, error: Error) {
    try {
      if (error instanceof InvalidPayloadProcessingError || error instanceof EntityNotFoundError) {
        const errorName =
          error instanceof EntityNotFoundError
            ? ErrorName.EntityNotFoundWhenProcessingError
            : ErrorName.InvalidMessageProcessStateError
        this.logger.error(ErrorCode.ValidationKomgoInboundAMQP, errorName, error.message, {
          message: { ...messageReceived, content: REDACTED_CONTENT, errorMessage: error.message }
        })
        messageReceived.reject()
      } else {
        this.logger.error(ErrorCode.ConnectionInternalMQ, ErrorName.MessageProcessFailed, {
          message: { ...messageReceived, content: REDACTED_CONTENT, errorMessage: error.message }
        })
        messageReceived.requeue()
      }
    } catch (e) {
      this.logger.error(ErrorCode.ConnectionInternalMQ, ErrorName.MessageProcessErrorHandlingFailed, {
        message: { ...messageReceived, content: REDACTED_CONTENT, errorMessage: error.message }
      })
    }
  }
}
