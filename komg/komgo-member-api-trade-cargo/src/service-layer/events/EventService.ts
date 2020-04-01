import IService from './IService'
import { getLogger } from '@komgo/logging'
import { TYPES } from '../../inversify/types'
import { IMessageConsumer, MessagingFactory, IMessageReceived } from '@komgo/messaging-library'
import { inject, injectable } from 'inversify'
import { IMessageData } from '../../business-layer/data/request-messages/IMessageData'
import { MESSAGE_TYPE } from '../../business-layer/data/request-messages/MessageType'
import { ICargoEventProcessor } from './process/ICargoEventProcessor'
import { ITradeEventProcessor } from './process/ITradeEventProcessor'
import { ICommonEventProcessor } from './process/IEventProccessor'
import IPollingServiceFactory from '../IPollingServiceFactory'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../utils/Constants'
import { TradeSource } from '@komgo/types'
import { VALUES } from '../../inversify/values'

export const VAKT_INCOMING_ROUTE_KEY_PREFIX = 'KOMGO.Trade.'

@injectable()
export class EventService implements IService {
  private readonly consumer: IMessageConsumer
  private readonly eventProcessors: { [id: string]: ICommonEventProcessor } = {}
  private asyncPolling: IService
  private readonly logger = getLogger('EventService')

  constructor(
    @inject(TYPES.MessagingFactory) messagingFactory: MessagingFactory,
    @inject(TYPES.TradeEventProcessor) tradeEventProcessor: ITradeEventProcessor,
    @inject(TYPES.CargoEventProcessor) cargoEventProcessor: ICargoEventProcessor,
    @inject(VALUES.ConsumerId) consumerId: string,
    @inject(VALUES.InboundPublisherId) private inboundPublisherId: string,
    @inject(TYPES.PollingServiceFactory) pollingFactory: IPollingServiceFactory | any,
    @inject('internal-mq-polling-interval-ms') pollingInterval: number
  ) {
    this.consumer = messagingFactory.createConsumer(consumerId)
    this.eventProcessors[MESSAGE_TYPE.KOMGO_Trade_TradeData] = tradeEventProcessor
    this.eventProcessors[MESSAGE_TYPE.KOMGO_Trade_CargoData] = cargoEventProcessor
    this.asyncPolling = pollingFactory.createPolling(async end => {
      // TODO: This polling approach is not safe and has to be load tested,
      // it rely on the fact that the previous message is consumed when a new one is picked and this is not necessary true all the time
      // we should replace it by pipelining the async calls.. instead!!!
      // e.g.
      // async function executeAsyncTask () {
      //   const valueA = await functionA()
      //   const valueB = await functionB(valueA)
      //   return executeAsyncTask(valueA, valueB)
      //  }
      await this.receiveAndConsumeMessages()
      end()
    }, pollingInterval)
  }

  start() {
    this.logger.info('TradeEventsService started')
    try {
      this.asyncPolling.start()
    } catch (error) {
      this.logger.error(
        ErrorCode.Configuration,
        ErrorName.AsyncPollingFailed,
        'Cannot start AsyncPolling to retrieve trade/cargo messages'
      )
      return
    }
  }

  async stop() {
    this.logger.info('TradeEventsService stopped')
    try {
      await this.consumer.close()
    } catch (e) {
      this.logger.error(
        ErrorCode.ConnectionInternalMQ,
        ErrorName.ClosingConnectionInternalMQFailed,
        'Unable to close connection to Internal-MQ.'
      )
    }
  }

  private async receiveAndConsumeMessages() {
    try {
      let routingKeys = [`TradeData`, `CargoData`]
      routingKeys = routingKeys.map(key => `${VAKT_INCOMING_ROUTE_KEY_PREFIX}${key}`)
      const message = await this.consumer.get(this.inboundPublisherId, routingKeys)
      if (message) {
        try {
          await this.processMessage(message)
        } catch (error) {
          this.logger.error(
            ErrorCode.ValidationInternalAMQP,
            ErrorName.MessageProcessingFailed,
            'Error processing message',
            {
              messageId: message.options.messageId,
              routingKey: message.routingKey,
              error: JSON.stringify(error)
            }
          )
        }
      }
    } catch (error) {
      // this.logger.error(
      //   ErrorCode.ConnectionInternalMQ,
      //   ErrorName.InternalMQEventFailed,
      //   'Cannot read events. Please check that internal-mq is ready. Retrying...',
      //   {
      //     publisherId: this.publisherId
      //   }
      // )
    }
  }

  private async processMessage(message: IMessageReceived) {
    const messageContent = message.content as IMessageData
    const { vaktId } = messageContent

    if (!vaktId) {
      this.logger.error(
        ErrorCode.ValidationInternalAMQP,
        ErrorName.MessageProcessingFailed,
        'Found MQ message without required [vaktId] field'
      )
      message.ack()
      return
    }

    const eventProcessor = this.eventProcessors[messageContent.messageType]

    if (!eventProcessor) {
      this.logger.error(
        ErrorCode.ValidationInternalAMQP,
        ErrorName.MessageProcessingFailed,
        "Can't find message processor. Message processing failed. ACKing message",
        {
          messageType: messageContent.messageType,
          vaktId
        }
      )

      return message.ack()
    }

    try {
      await eventProcessor.processEvent(messageContent, TradeSource.Vakt)
      message.ack()
    } catch (err) {
      this.logger.error(
        ErrorCode.ValidationInternalAMQP,
        ErrorName.MessageProcessingFailed,
        'Error processing message',
        {
          type: messageContent.messageType,
          vaktId: messageContent.vaktId,
          err: err instanceof Error ? err.message : JSON.stringify(err)
        }
      )
      message.ack()
    }
  }
}
