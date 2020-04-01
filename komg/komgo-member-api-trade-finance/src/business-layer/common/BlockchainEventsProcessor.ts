import { inject, injectable, multiInject } from 'inversify'
import { IMessageReceived } from '@komgo/messaging-library'
import { TYPES } from '../../inversify/types'
import { getLogger } from '@komgo/logging'
import { IEventsProcessor } from './IEventsProcessor'
import { IEvent } from './IEvent'
import { IMessageEventProcessor } from '../message-processing/IMessageEventProcessor'
import IBlockchainEventMessage from './IBlockchainEventMessage'
import { InvalidMessageException } from '../../exceptions'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'
import { Metric } from '../../utils/Metrics'
@injectable()
export class BlockchainEventsProcessor implements IMessageEventProcessor {
  private readonly ROUTING_KEY_PREFIX = 'BLK.'
  private readonly logger = getLogger('BlockchainEventsProcessor')
  private routingKeys: string[]
  private readonly processorEventMappings: { [x: string]: IEventsProcessor } = {}
  private allEvents: any

  constructor(@multiInject(TYPES.EventsProcessor) readonly processors: IEventsProcessor[]) {
    this.logger.info(`Loaded ${processors.length} blockchain event processors`)
    this.buildEventProcessors(processors)
  }

  async getKeysToProcess(): Promise<string[]> {
    this.routingKeys = Object.keys(this.processorEventMappings).map(key => this.ROUTING_KEY_PREFIX + key)

    return this.routingKeys
  }

  async processEvent(message: IMessageReceived) {
    this.logger.metric({
      [Metric.BlockchainEventReceived]: message.routingKey
    })
    const topic = message.routingKey.replace(this.ROUTING_KEY_PREFIX, '')
    const contractEvent = this.allEvents[topic]

    if (!contractEvent) {
      const err = `Event for [${topic}] not found`
      this.logger.error(ErrorCode.BlockchainEventValidation, ErrorNames.BlockchainEventNotFound, err, {
        eventName: topic
      })
      throw new InvalidMessageException(err)
    }

    const eventName = contractEvent.name

    const content = message.content as IBlockchainEventMessage
    const { data: eventData, blockNumber, transactionHash, contractAddress } = content

    this.logger.info('Blockchain event message received', {
      routingKey: message.routingKey,
      messageId: message.options.messageId,
      eventName: eventName || 'anonymous'
    })

    const event: IEvent = {
      data: eventData,
      topics: [topic],
      blockNumber,
      transactionHash,
      address: contractAddress
    }

    const eventProcessor = this.processorEventMappings[topic]
    this.logger.info('Found processor for event', {
      transaction: content.transactionHash,
      address: content.contractAddress
    })

    await eventProcessor.processEvent(event)
    this.logger.metric({
      [Metric.BlockchainEventFinished]: message.routingKey
    })
  }

  private buildEventProcessors(processors: IEventsProcessor[]): any {
    this.allEvents = {}
    processors.forEach(processor => {
      const eventMapping = processor.getEventMappings()
      Object.assign(this.allEvents, eventMapping)

      Object.keys(eventMapping).forEach(event => (this.processorEventMappings[event] = processor))
    })
  }
}
