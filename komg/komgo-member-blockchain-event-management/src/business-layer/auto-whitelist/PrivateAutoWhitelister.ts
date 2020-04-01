import { getLogger } from '@komgo/logging'
import { injectable, inject } from 'inversify'
import Web3 from 'web3'
import { Log } from 'web3-core'
import { toHex } from 'web3-utils'

import { ContractAddressDataAgent, IContractLibraryDataAgent } from '../../data-layer/data-agents'
import { AutoWhitelistDataAgent } from '../../data-layer/data-agents/AutoWhitelistDataAgent'
import { TYPES } from '../../inversify/types'
import { VALUES } from '../../inversify/values'
import { Metric, Action, AutoWhitelistType } from '../../util/Metrics'
import RateLimiter from '../../util/RateLimiter'
import { BlockchainConnectionError } from '../errors'

@injectable()
export class PrivateAutoWhitelister {
  private readonly logger = getLogger('PrivateAutoWhitelister')
  private readonly rateLimitedGetPastLogs: (options: { fromBlock: string; toBlock: string }) => Promise<any>
  private readonly rateLimitedGetBlockNumber: () => Promise<number>

  constructor(
    @inject(TYPES.Web3Instance) private readonly web3: Web3,
    @inject(TYPES.ContractAddressDataAgent) private readonly contractAddressDataAgent: ContractAddressDataAgent,
    @inject(TYPES.ContractLibraryDataAgent) private readonly contractLibraryDataAgent: IContractLibraryDataAgent,
    @inject(TYPES.AutoWhitelistDataAgent) private readonly autoWhitelistDataAgent: AutoWhitelistDataAgent,
    @inject(VALUES.AutoWhitelistChunkSize) private readonly autoWhitelistChunkSize: number,
    @inject(VALUES.MaxRequestPerSecond) maxRequestsPerSecond: number,
    rateLimiter: RateLimiter = new RateLimiter(maxRequestsPerSecond)
  ) {
    this.rateLimitedGetBlockNumber = rateLimiter.wrap(this.web3.eth.getBlockNumber)
    this.rateLimitedGetPastLogs = rateLimiter.wrap(this.web3.eth.getPastLogs)
  }

  /**
   * Auto whitelist private smart contracts
   */
  public async processEvents() {
    this.logger.info('Starting private auto whitelist')

    const startBlockNumber = await this.autoWhitelistDataAgent.getStartBlockNumber()
    const stopBlockNumber = await this.autoWhitelistDataAgent.getStopBlockNumber()
    const latestBlockNumber = await this.tryBlockchain(() => this.rateLimitedGetBlockNumber(), {
      message: 'Failed to get current block number'
    })

    const currentStopBlockNumber = Math.min(stopBlockNumber, latestBlockNumber)
    if (startBlockNumber > currentStopBlockNumber) {
      this.logger.info('Skipping private auto whitelist. Start block is larger than stop block.', {
        startBlockNumber,
        stopBlockNumber,
        latestBlockNumber
      })
      return
    }

    await this.processBatchedEvents(startBlockNumber, currentStopBlockNumber)
    this.logger.info('Finished private auto whitelist')
  }

  private async processBatchedEvents(startBlock: number, endBlock: number) {
    let start: number = startBlock
    this.logger.info('Processing events from block number %d to %d', startBlock, endBlock)
    while (start <= endBlock) {
      const stop = Math.min(endBlock, start + this.autoWhitelistChunkSize - 1)
      await this.processEventsInBlockRange(start, stop)
      start += this.autoWhitelistChunkSize
    }
  }

  private async processEventsInBlockRange(from: number, to: number): Promise<any> {
    const fromBlock = toHex(from)
    const toBlock = toHex(to)
    const logs = await this.tryBlockchain(() => this.rateLimitedGetPastLogs({ fromBlock, toBlock }), {
      message: 'Failed to get event logs from blockchain',
      from,
      to
    })
    await this.validateLogs(logs)
    await this.autoWhitelistDataAgent.setStartBlockNumber(to + 1)
    this.logger.info('Processed event logs chunk from block %d to %d', from, to)
  }

  private async validateLogs(logs: Log[]): Promise<void> {
    let whitelisted = 0
    for (const log of logs) {
      const isKomgoContractCreation =
        log.topics.length && (await this.contractLibraryDataAgent.isExistingCreateEventSigHash(log.topics[0] as string))
      if (isKomgoContractCreation) {
        await this.contractAddressDataAgent.whitelist(log.address, log.transactionHash)
        this.logger.metric({
          [Metric.Action]: Action.Whitelisted,
          [Metric.Address]: log.address,
          [Metric.AutoWhitelist]: true,
          [Metric.AutoWhitelistType]: AutoWhitelistType.Private
        })
        this.logger.debug('Whitelisted address from log', { log })
        whitelisted++
      } else {
        this.logger.debug('Log is not a Komgo Contract Creation event. Skipping', { log })
      }
    }
    this.logger.info('Whitelisted addresses from %d logs out of %d', whitelisted, logs.length)
  }

  private async tryBlockchain(fn: (...args: any[]) => Promise<any>, context?: object) {
    try {
      return await fn()
    } catch (error) {
      throw new BlockchainConnectionError(error.message, context)
    }
  }
}
