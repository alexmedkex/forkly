import { Web3Wrapper } from '@komgo/blockchain-access'
import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IMessageConsumer, MessagingFactory, IMessageReceived } from '@komgo/messaging-library'
import { injectable, inject } from 'inversify'

import { IEventsProcessor } from '../../business-layer/cache/IEventsProcessor'
import { IRegistryEventProcessedDataAgent } from '../../data-layer/data-agents/IRegistryEventProcessedDataAgent'
import { ErrorNames } from '../../exceptions/utils'
import { TYPES } from '../../inversify/types'
import { Metric } from '../../utils/Metrics'
import IPollingServiceFactory from '../IPollingServiceFactory'

import IService from './IService'

@injectable()
export class CacheEventService implements IService {
  public events: Promise<any>

  private logger = getLogger('CacheEventService')
  private readonly ROUTING_KEY_PREFIX = 'BLK.'
  private consumer: IMessageConsumer
  private publisherId: string
  private eventsProcessor: IEventsProcessor
  private eventProcessedDataAgent: IRegistryEventProcessedDataAgent
  private asyncPolling: IService
  private routingKeys: string[]

  constructor(
    @inject(TYPES.MessagingFactory) messagingFactory: MessagingFactory | any,
    @inject('consumer-id') consumerId: string,
    @inject('from-publisher-id') publisherId: string,
    @inject('internal-mq-polling-interval-ms') pollingInterval: number,
    @inject(TYPES.EventsProcessor) eventsProcessor: IEventsProcessor | any,
    @inject(TYPES.RegistryEventProcessedDataAgent) eventProcessedDataAgent: IRegistryEventProcessedDataAgent | any,
    @inject(TYPES.PollingServiceFactory) pollingFactory: IPollingServiceFactory | any,
    @inject(TYPES.Web3Wrapper) private readonly web3Wrapper: Web3Wrapper
  ) {
    this.consumer = messagingFactory.createConsumer(consumerId)
    this.publisherId = publisherId
    this.eventsProcessor = eventsProcessor
    this.eventProcessedDataAgent = eventProcessedDataAgent
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
      await this.readAndConsumeEvents()
      end()
    }, pollingInterval)
  }

  async start() {
    this.logger.info('CacheEventService started')
    this.events = await this.loadRoutingKeysFromEvents()
    this.routingKeys = Object.keys(this.events).map(key => this.ROUTING_KEY_PREFIX + key)

    try {
      this.asyncPolling.start()
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionInternalMQ,
        ErrorNames.AsyncPollingStartFailed,
        'Cannot start AsyncPolling to retrieve blockchain events',
        {
          errorObject: error
        }
      )
      return
    }
  }

  async readAndConsumeEvents() {
    try {
      const message = await this.consumer.get(this.publisherId, this.routingKeys)
      if (message) {
        try {
          await this.consumeMessage(message, this.events)
        } catch (error) {
          this.logger.info(
            'Error processing message',
            {
              messageId: message.options.messageId,
              routingKey: message.routingKey,
              errorObject: error
            },
            new Error().stack
          )
        }
      }
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionInternalMQ,
        ErrorNames.ReadAndConsumeEventsFailed,
        `Cannot read events from ${this.publisherId}. Please check that internal-mq is ready. Retrying...`,
        {
          errorObject: error
        },
        new Error().stack
      )
    }
  }

  async stop() {
    this.logger.info('CacheEventService stopped')
    try {
      await this.consumer.close()
    } catch (e) {
      this.logger.error(
        ErrorCode.ConnectionInternalMQ,
        ErrorNames.CloseConsumerFailed,
        `Unable to close connection to Internal-MQ.`,
        new Error().stack
      )
    }
  }

  private async consumeMessage(message: IMessageReceived, events: any) {
    this.logger.metric({
      [Metric.FlowMessageReceived]: message.routingKey
    })
    const topic = message.routingKey.replace(this.ROUTING_KEY_PREFIX, '')
    const event = events[topic]
    // tslint:disable-next-line:no-string-literal
    const eventData = message.content['data']
    // tslint:disable-next-line:no-string-literal
    const blockNumber = message.content['blockNumber']
    // tslint:disable-next-line:no-string-literal
    const transactionHash = message.content['transactionHash']
    // tslint:disable-next-line:no-string-literal
    const transactionIndex = message.content['transactionIndex']
    // tslint:disable-next-line:no-string-literal
    const address = message.content['contractAddress']
    // tslint:disable-next-line:no-string-literal
    const logIndex = message.content['logIndex']
    let eventName = 'UnknownEvent'
    if (event) {
      eventName = event.name
    }
    const messageDetails = this.getMessageDetails(message, eventName)
    const lastProcessedEvent = await this.eventProcessedDataAgent.getLastEventProcessed()
    if (!lastProcessedEvent) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.LastProcessedEventNotFound,
        messageDetails,
        new Error().stack
      )
    }
    this.logger.info('Message consumed', messageDetails)
    if (
      this.isBlockHigher(lastProcessedEvent.blockNumber, blockNumber) ||
      this.isTransactionHigher(
        lastProcessedEvent.blockNumber,
        blockNumber,
        lastProcessedEvent.transactionIndex,
        transactionIndex
      ) ||
      this.isLogIndexHigher(
        lastProcessedEvent.blockNumber,
        blockNumber,
        lastProcessedEvent.transactionIndex,
        transactionIndex,
        lastProcessedEvent.logIndex,
        logIndex
      )
    ) {
      await this.eventsProcessor.processEvent({
        data: eventData,
        topics: [topic],
        blockNumber,
        transactionIndex,
        transactionHash,
        logIndex,
        address
      })
    } else {
      this.logger.warn(
        ErrorCode.ValidationInternalAMQP,
        ErrorNames.MessageAlreadyProcessed,
        'Message was already processed (duplicated). It will be discarded and removed from the queue',
        messageDetails,
        new Error().stack
      )
    }
    message.ack()
    this.logger.info(`Message ACK'd`, {
      routingKey: message.routingKey,
      messageId: message.options.messageId,
      event: eventName
    })
    this.logger.metric({
      [Metric.FlowMessageProcessed]: event.routingKey
    })
  }

  private getMessageDetails(message: IMessageReceived, eventName: string) {
    return {
      messageId: message.options.messageId,
      routingkey: message.routingKey,
      event: eventName
    }
  }

  private async loadRoutingKeysFromEvents(): Promise<any> {
    const deployedContracts = await this.eventsProcessor.getDeployedContracts()
    const events = this.web3Wrapper.buildEventsMapping(deployedContracts)
    return events
  }

  private isBlockHigher(currentBlockNumber: number, newBlockNumber: number) {
    return newBlockNumber > currentBlockNumber
  }

  private isTransactionHigher(
    currentBlockNumber: number,
    newBlockNumber: number,
    currentTransactionIndex: number,
    newTransactionIndex: number
  ) {
    return newBlockNumber === currentBlockNumber && newTransactionIndex > currentTransactionIndex
  }

  private isLogIndexHigher(
    currentBlockNumber: number,
    newBlockNumber: number,
    currentTransactionIndex: number,
    newTransactionIndex: number,
    currentLogIndex: number,
    newLogIndex: number
  ) {
    return (
      newBlockNumber === currentBlockNumber &&
      newTransactionIndex === currentTransactionIndex &&
      newLogIndex > currentLogIndex
    )
  }
}
