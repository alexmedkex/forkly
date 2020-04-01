import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { injectable, inject } from 'inversify'

import { PrivateAutoWhitelister } from '../business-layer/auto-whitelist/PrivateAutoWhitelister'
import { BlockchainConnectionError } from '../business-layer/errors'
import { EventProcessedDataAgent } from '../data-layer/data-agents'
import { AutoWhitelistDataAgent } from '../data-layer/data-agents/AutoWhitelistDataAgent'
import { TYPES } from '../inversify/types'
import { VALUES } from '../inversify/values'
import { ErrorName } from '../util/ErrorName'

const NO_AUTO_WHITELIST = 0

@injectable()
export default class PrivateAutoWhitelistService {
  private readonly logger = getLogger('PrivateAutoWhitelistService')

  constructor(
    @inject(TYPES.EventProcessedDataAgent) private readonly eventProcessedDataAgent: EventProcessedDataAgent,
    @inject(TYPES.AutoWhitelistDataAgent) private readonly autoWhitelistDataAgent: AutoWhitelistDataAgent,
    @inject(TYPES.PrivateAutoWhitelister) private readonly privateAutoWhitelister: PrivateAutoWhitelister,
    @inject(VALUES.AutoWhitelistBeforeBlock) private readonly autoWhitelistBeforeBlock: number
  ) {}

  async start() {
    try {
      await this.setAutoWhitelistThreshold()
      await this.privateAutoWhitelister.processEvents()
    } catch (error) {
      this.processError(error)
    }
  }

  /**
   * This sets the STOP block. Auto Whitelist will run from its last processed block (block 0 if first time)
   * Until the STOP block.
   *
   * 1. If STOP block already set -> do nothing. Log that it is already set
   * 2. If Not set, use one of the following (in preferred order):
   *    a. env var AutoWhitelistBeforeBlock-1 (0 means unset)
   *    b. last event processed by BlockchainEventService
   *    c. -1
   */
  private async setAutoWhitelistThreshold() {
    this.logger.info('Setting auto whitelist threshold')
    const savedStopBlock = await this.autoWhitelistDataAgent.getStopBlockNumber()

    if (savedStopBlock) {
      this.logger.info('Last block number to auto whitelist is already set to %d.', savedStopBlock)
      return
    } else if (this.autoWhitelistBeforeBlock !== NO_AUTO_WHITELIST) {
      const stopBlock = this.autoWhitelistBeforeBlock - 1
      this.logger.info('Setting last block for auto whitelist to %d', stopBlock)
      await this.autoWhitelistDataAgent.setStopBlockNumber(stopBlock)
    } else {
      const lastEvent = await this.eventProcessedDataAgent.getLastEventProcessed()
      if (lastEvent) {
        const lastBlockNumberProcessed = (lastEvent as any).blockNumber
        this.logger.info(
          'Setting last block for auto whitelist to the last block processed: %d',
          lastBlockNumberProcessed
        )
        await this.autoWhitelistDataAgent.setStopBlockNumber(lastBlockNumberProcessed)
      } else {
        this.logger.info('No stop block number specified. Setting last block for auto whitelist to -1')

        await this.autoWhitelistDataAgent.setStopBlockNumber(-1)
      }
    }
  }

  private processError(error) {
    if (error instanceof BlockchainConnectionError) {
      this.logger.error(
        ErrorCode.BlockchainConnection,
        ErrorName.PrivateWhitelistBlockchainConnectionFailed,
        'Failed to connect to the blockchain while auto whitelisting private contracts',
        { errorMessage: error.message, ...error.data }
      )
    } else {
      this.logger.error(
        ErrorCode.BlockchainEventValidation,
        ErrorName.PrivateWhitelistEventProcessingError,
        'Unexpected error while auto whitelisting private contracts from events',
        { errorMessage: error.message }
      )
    }
    throw error
  }
}
