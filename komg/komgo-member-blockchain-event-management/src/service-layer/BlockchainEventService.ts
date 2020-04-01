import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IMessagePublisher, MessagingFactory } from '@komgo/messaging-library'
import { injectable, inject } from 'inversify'
import Web3 from 'web3'
import { TransactionReceipt, Log } from 'web3-core'

import EventValidator from '../business-layer/events-validation/EventValidator'
import { EventProcessedDataAgent } from '../data-layer/data-agents'
import { IEventProcessedDocument } from '../data-layer/models/events/IEventProcessedDocument'
import { TYPES } from '../inversify/types'
import { VALUES } from '../inversify/values'
import { ErrorName } from '../util/ErrorName'
import { generateRequestId } from '../util/generation'
import { Metric } from '../util/Metrics'
import RateLimiter from '../util/RateLimiter'

import { EventObject } from './EventObject'
import IService from './IService'
import PollingServiceFactory from './PollingServiceFactory'

@injectable()
export default class BlockchainEventService implements IService {
  private readonly logger = getLogger('BlockchainEventService')
  private readonly blockchainRKPrefix = 'BLK'
  private readonly asyncPolling: IService
  private readonly publisher: IMessagePublisher
  private readonly rateLimitedGetTransactionReceipt: (txHash: string) => Promise<TransactionReceipt>
  private readonly rateLimitedGetBlock: (blockNumber: number, includeTxs: boolean) => Promise<any>
  private readonly rateLimitedGetBlockNumber: () => Promise<number>

  constructor(
    @inject(TYPES.Web3Instance) private readonly web3: Web3,
    @inject(TYPES.EventProcessedDataAgent) private readonly eventProcessedDataAgent: EventProcessedDataAgent,
    @inject(TYPES.EventValidator) private readonly eventValidator: EventValidator,
    @inject(TYPES.MessagingFactory) messagingFactory: MessagingFactory,
    @inject(TYPES.PollingServiceFactory) pollingFactory: PollingServiceFactory,
    @inject(VALUES.PublisherId) publisherId: string,
    @inject(VALUES.PollingIntervalMs) pollingInterval: number,
    @inject(VALUES.MaxRequestPerSecond) maxRequestsPerSecond: number
  ) {
    this.publisher = messagingFactory.createRetryPublisher(publisherId)
    this.asyncPolling = pollingFactory.createPolling(async end => {
      await this.readEvents()
      end()
    }, pollingInterval)

    const rateLimiter: RateLimiter = new RateLimiter(maxRequestsPerSecond)
    this.rateLimitedGetTransactionReceipt = rateLimiter.wrap(this.web3.eth.getTransactionReceipt)
    this.rateLimitedGetBlockNumber = rateLimiter.wrap(this.web3.eth.getBlockNumber)
    this.rateLimitedGetBlock = rateLimiter.wrap(this.web3.eth.getBlock)
  }

  public async start() {
    try {
      const account = await this.web3.eth.getAccounts()
      this.logger.info('Successfully connected to blockchain ', {
        account
      })
    } catch (error) {
      this.logger.warn(ErrorCode.BlockchainConnection, ErrorName.UnableToConnectOnStart, error.message)
    }

    let lastEventProcessedInitialised = false
    while (!lastEventProcessedInitialised) {
      try {
        this.logger.info(`Checking processed events`)
        const lastEvent = await this.eventProcessedDataAgent.getLastEventProcessed()
        if (!lastEvent) {
          this.logger.info(`eventprocessed is empty, creating document...`)
          await this.eventProcessedDataAgent.saveEventProcessed(0, 'hash', 0)
        }
        lastEventProcessedInitialised = true
      } catch (error) {
        this.logger.error(ErrorCode.Connection, ErrorName.LastEventProcessedInitialisedError, {
          errorMessage: error.message
        })
      }
    }

    this.asyncPolling.start()
  }

  public async stop() {
    await this.publisher.close()
    this.asyncPolling.stop()
  }

  private async readEvents() {
    this.logger.info('Reading events...')

    try {
      const blockNumber = await this.rateLimitedGetBlockNumber()
      const lastEvent: IEventProcessedDocument = await this.eventProcessedDataAgent.getLastEventProcessed()
      if (!lastEvent) {
        this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.LastEventUndefined)
        return
      }
      const lastProcessedBlock = lastEvent.blockNumber

      if (lastProcessedBlock > blockNumber) {
        this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.BlockNumberInconsistency, {
          lastProcessedBlock,
          blockNumber
        })
        return
      }
      this.logger.info('Processing sequence from ', {
        lastProcessedBlock,
        blockNumber
      })
      const blocksSequence = this.sequenceBetween(lastProcessedBlock, blockNumber)
      for (const block of blocksSequence) {
        await this.processBlock(lastEvent, block)
      }
    } catch (error) {
      this.logger.warn(ErrorCode.BlockchainConnection, ErrorName.ReadingEventsError, error.message)
    }
  }

  private async processBlock(lastEvent: IEventProcessedDocument, blockNumber: number) {
    this.logger.info('Processing block ', {
      blockNumber
    })

    let processedBlock = false
    let txProcessed = 0
    while (!processedBlock) {
      try {
        const block = await this.rateLimitedGetBlock(blockNumber, false)
        const txs = block.transactions
        let txStart = 0
        if (lastEvent.blockNumber === blockNumber) {
          txStart = txs.indexOf(lastEvent.transactionHash)
          // If we are processing the first block
          if (txStart === -1) txStart = 0
        }
        for (const tx of txs.slice(txStart, txs.length)) {
          await this.processTransaction(lastEvent, blockNumber, tx)
          txProcessed++
        }
        this.logger.info('Processed block successfully', {
          blockNumber
        })
        processedBlock = true
      } catch (error) {
        this.logger.error(ErrorCode.BlockchainConnection, ErrorName.EventProcessingError, error.message, {
          blockNumber
        })
      }
    }

    if (processedBlock && txProcessed === 0) {
      this.logger.info('Saving empty block', {
        blockNumber
      })
      await this.eventProcessedDataAgent.saveEventProcessed(blockNumber, 'empty', 0)
    }
  }

  private async processTransaction(lastEvent: IEventProcessedDocument, blockNumber: number, txHash: string) {
    this.logger.info('Processing transaction ', {
      blockProcessing: true,
      blockNumber,
      tx: txHash
    })

    let logIndexStart = 0
    if (lastEvent.transactionHash === txHash) {
      logIndexStart = lastEvent.logIndex + 1
    }

    const receipt = await this.rateLimitedGetTransactionReceipt(txHash)
    const logs = receipt.logs
    if (!Array.isArray(logs) || !logs.length) {
      this.logger.info('Saving empty transaction ', {
        blockNumber,
        tx: txHash
      })
      await this.eventProcessedDataAgent.saveEventProcessed(blockNumber, txHash, 0)
    }

    for (const log of logs.slice(logIndexStart, logs.length)) {
      const isValid = await this.eventValidator.validate(log)
      if (!isValid) {
        this.logger.info('Contract is blacklisted, skip the entire transaction but save the event', {
          blockNumber,
          tx: txHash
        })
        // If the contract is blacklisted, skip the entire transaction but save the event
        await this.eventProcessedDataAgent.saveEventProcessed(blockNumber, txHash, log.logIndex)
        return
      }

      const logIndex = logs.indexOf(log)
      await this.publishEvent(log, blockNumber, txHash, receipt, logIndex)
    }
  }

  private async publishEvent(
    currentLog: Log,
    blockNumber: number,
    txHash: string,
    receipt: TransactionReceipt,
    logIndex: number
  ) {
    const requestId = generateRequestId() // to avoid setting unrelated requestId in other logs
    const routingKey = `${this.blockchainRKPrefix}.${currentLog.topics[0]}`
    const eventObject = this.createEventObject(currentLog, blockNumber, txHash, receipt.transactionIndex, logIndex)
    try {
      this.logger.info('Valid event detected. Pushing to Internal-MQ ', {
        blockNumber,
        txHash,
        logIndex,
        requestId
      })
      await this.publisher.publish(routingKey, eventObject, { requestId })
      this.logger.metric({ [Metric.BlockchainEventProcessed]: true, requestId })
    } catch (error) {
      this.logger.error(ErrorCode.ConnectionInternalMQ, ErrorName.EventMQPublishError, error.message, {
        blockNumber,
        routingKey,
        txHash,
        logIndex,
        requestId
      })
      return
    }

    await this.eventProcessedDataAgent.saveEventProcessed(blockNumber, txHash, logIndex)
  }

  private createEventObject(log: any, blockNumber: number, txHash: string, txIndex: number, logIndex: number) {
    const eventObject = new EventObject()
    eventObject.contractAddress = log.address
    eventObject.data = log.data
    eventObject.blockNumber = blockNumber
    eventObject.transactionIndex = txIndex
    eventObject.transactionHash = txHash
    eventObject.logIndex = logIndex

    return eventObject
  }

  private sequenceBetween(start: number, end: number): number[] {
    return Array(end - start + 1)
      .fill(Number)
      .map((_, idx) => start + idx)
  }
}
