import { injectable, inject, multiInject } from 'inversify'
import { MessagingFactory, IMessageConsumer, IMessageReceived } from '@komgo/messaging-library'
import { TYPES } from '../../inversify/types'
import { DocumentMessageType } from '../messaging/messageTypes'
import { getLogger } from '@komgo/logging'
import IPollingServiceFactory from '../../service-layer/IPollingServiceFactory'
import { IMessageEventProcessor } from './IMessageEventProcessor'
import { forEach } from 'lodash'
import IService from '../IService'
import { CONFIG } from '../../inversify/config'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'
import { InvalidMessageException } from '../../exceptions'
import { Metric } from '../../utils/Metrics'

@injectable()
export class MessageProcessor implements IService {
  private logger = getLogger('MessageProcessor')
  private consumer: IMessageConsumer
  private asyncPolling: IService
  private routingKeys: string[] = []
  private readonly eventProcessors: { [id: string]: IMessageEventProcessor } = {}

  constructor(
    @inject(TYPES.MessagingFactory) messagingFactory: MessagingFactory | any,
    @inject(CONFIG.ConsumerId) consumerId: string | any,
    @inject(CONFIG.FromPublisherId) private publisherId: string | any,
    @inject(CONFIG.TradeCargosPublisherId) private tradeCargosPublisherId: string | any,
    @inject(CONFIG.InternalMqPollingIntervalMs) pollingInterval: number,
    @inject(TYPES.PollingServiceFactory) pollingFactory: IPollingServiceFactory | any,
    @multiInject(TYPES.MessageEventProcessor) private readonly messageEventProcessors: IMessageEventProcessor[] | any
  ) {
    this.consumer = messagingFactory.createConsumer(consumerId)
    this.asyncPolling = pollingFactory.createPolling(async end => {
      await this.readAndConsumeEvents(this.publisherId) // for Blockchain Events
      await this.readAndConsumeEvents(this.tradeCargosPublisherId) // For Trade-Cargo updates
      end()
    }, pollingInterval)
  }

  async start() {
    this.logger.info('MessageProcessor started')

    await Promise.all(
      this.messageEventProcessors.map(async (processor: IMessageEventProcessor) => {
        const keys = await processor.getKeysToProcess()

        this.routingKeys = this.routingKeys.concat(keys)

        keys.forEach(k => {
          this.eventProcessors[k] = processor
        })
      })
    )

    this.logger.info(`Listening started for ${Object.keys(this.eventProcessors)}`)
    this.logger.info(`Connected to internal-MQ exchange`, { publisherId: this.publisherId })

    try {
      await this.asyncPolling.start()
    } catch (error) {
      this.logger.info('async polling failed', {
        publisherId: this.publisherId
      })
      return
    }
  }

  async stop() {
    this.logger.info('stopping...')
    try {
      await this.consumer.close()
      await this.asyncPolling.stop()
      this.logger.info('stopped')
    } catch (e) {
      this.logger.info(`Unable to close connection to Internal-MQ.`)
    }
  }

  async readAndConsumeEvents(publisherId: string) {
    try {
      const message = await this.consumer.get(publisherId, this.routingKeys)

      if (message) {
        this.logger.info('Processing message', {
          messageId: message.options.messageId,
          routingKey: message.routingKey
        })
        try {
          await this.consumeMessage(message)
        } catch (error) {
          this.logger.info('failed to consume message')
        }
      }
    } catch (error) {
      this.logger.error(
        ErrorCode.ValidationInternalAMQP,
        ErrorNames.ReadInternalMQEventsFailed,
        `Cannot read events from ${this.publisherId}. Please check that internal-mq is ready. Retrying...`,
        { errorMessage: error.message, publisherId: this.publisherId }
      )
    }
  }

  private async consumeMessage(message: IMessageReceived) {
    this.logger.metric({
      [Metric.FlowMessageReceived]: message.routingKey
    })
    const key = this.resolveMessageKey(message)
    const messageId = message.options.messageId

    this.logger.info(`Processing message, for key: ${key}`, { publisherId: this.publisherId })

    const processor = this.eventProcessors[key]

    if (!processor) {
      this.logger.error(
        ErrorCode.ValidationInternalAMQP,
        ErrorNames.MessageProcessorNotFound,
        `Can't find message processor for: ${key}`,
        {
          publisherId: this.publisherId
        }
      )
      return message.reject()
    }
    try {
      this.logger.info('processing event', {
        publisherId: this.publisherId
      })
      await processor.processEvent(message)
      message.ack()
      this.logger.metric({
        [Metric.FlowMessageProcessed]: message.routingKey
      })
    } catch (err) {
      if (err instanceof InvalidMessageException) {
        message.reject()
        this.logger.info('Message rejected. Type: %s; message id: %s', key, messageId)
      } else {
        message.requeue()
        this.logger.info('Message requeued. Type: %s; message id: %s', key, messageId)
      }
    }
  }

  private resolveMessageKey(message: IMessageReceived) {
    if (message.content && (message.content as any).messageType) {
      return (message.content as any).messageType
    }

    return message.routingKey
  }
}
