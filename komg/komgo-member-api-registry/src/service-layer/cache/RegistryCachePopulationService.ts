import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { injectable, inject } from 'inversify'
import { isEqual } from 'lodash'
import Web3 from 'web3'

import { IEventsProcessor } from '../../business-layer/cache/IEventsProcessor'
import { IRegistryCacheDataAgent } from '../../data-layer/data-agents/cache/IRegistryCacheDataAgent'
import { ErrorNames } from '../../exceptions/utils'
import BlockchainSignerClient from '../../infrastructure/api-blockchain-signer/BlockchainSignerClient'
import SignerClient from '../../infrastructure/api-signer/SignerClient'
import { TYPES } from '../../inversify/types'
import IService from '../events/IService'

import { CachePopulationStateHolder, PopulationState } from './CachePopulationStateHolder'
import IRegistryCachePopulationService from './IRegistryCachePopulationService'

@injectable()
export class RegistryCachePopulationService implements IRegistryCachePopulationService {
  private logger = getLogger('RegistryCachePopulationService')

  constructor(
    @inject(TYPES.EventsProcessor) private readonly eventsProcessor: IEventsProcessor | any,
    @inject(TYPES.RegistryCacheDataAgent) private readonly agent: IRegistryCacheDataAgent | any,
    @inject(TYPES.CacheEventService) private readonly cacheEventService: IService | any,
    @inject(TYPES.Web3) private readonly web3Instance: Web3 | any,
    @inject('prepopulation-chunk') private readonly prepopulationChunkSize: number,
    @inject('company-static-id') private readonly companyStaticId: string,
    @inject(TYPES.SignerClient) private readonly signerClient: SignerClient,
    @inject(TYPES.BlockchainSignerClient) private readonly blockchainSignerClient: BlockchainSignerClient,
    @inject(TYPES.CachePopulationStateHolder) private readonly populationStateHolder: CachePopulationStateHolder
  ) {}

  async clearPopulateAndStartService() {
    this.logger.info('Starting process to clear and populate cache...')
    this.populationStateHolder.setState(PopulationState.InProgress)
    try {
      await this.agent.clearCache()
    } catch (error) {
      return false
    }
    this.logger.info('Cache cleared')
    try {
      this.logger.info('Getting current blockNumber')
      const currentBlock = await this.web3Instance.eth.getBlockNumber()
      this.logger.info(
        `Populating from block 1 to block ${currentBlock} in chunks of ${this.prepopulationChunkSize} blocks`
      )
      let startBlock = 1
      let endBlock = Math.min(this.prepopulationChunkSize, currentBlock)
      let finished = false
      while (!finished) {
        if (endBlock === currentBlock) {
          finished = true
        }
        this.logger.info(`Populating from block ${startBlock} to ${endBlock}`)
        await this.eventsProcessor.processEventsBatch(startBlock, endBlock)
        this.logger.info(`Completed populating from block ${startBlock} to ${endBlock}`)
        startBlock = endBlock + 1
        endBlock = Math.min(startBlock + this.prepopulationChunkSize, currentBlock)
      }
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionDatabase,
        ErrorNames.PopulatingCacheError,
        'Error when populating company registry cache',
        {
          error: error.message,
          errorObject: error.stack
        },
        new Error().stack
      )
      return false
    }

    try {
      if (process.env.IS_LMS_NODE !== 'true' && !(await this.kapsuleKeyValidityCheck())) {
        return false
      }
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.KeyValidityCheckFailed,
        'Unable to validate eth keys from api-blockchain-signer and api-signer'
      )
      return false
    }

    this.populationStateHolder.setState(PopulationState.Complete)
    this.logger.info('Population successful. Starting service to listen for events from Internal-MQ')
    try {
      await this.cacheEventService.start()
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionInternalMQ,
        ErrorNames.StartEventServiceFailed,
        'Error when starting service to listen from Internal-MQ',
        {
          error: 'CatchEventServiceStartFailed',
          errorObject: error
        },
        new Error().stack
      )
      return false
    }
    this.logger.info('Service started')
    return true
  }

  private async kapsuleKeyValidityCheck(): Promise<boolean> {
    this.logger.info(`Checking keys validity for current kapsule with static ID ${this.companyStaticId}`)
    const currentCompanyData = await this.agent.getMembers(`{"staticId": "${this.companyStaticId}"}`)
    if (currentCompanyData.length === 0) {
      this.logger.crit(
        ErrorCode.ConfigurationOnbording,
        'CompanyNotFound',
        `Could not find company with static ID ${this.companyStaticId} in the registry`
      )
      return false
    }

    const ethKey = await this.blockchainSignerClient.getEthKey()
    this.logger.info(`Obtained Eth key`, { address: ethKey.address })
    const ethKeysInRegistry = currentCompanyData[0].ethPubKeys.filter(i => i.key !== '').map(i => i.address)
    if (!ethKeysInRegistry.find(address => address === ethKey.address)) {
      this.logger.crit(ErrorCode.ConfigurationOnbording, 'EthKeysMismatch', `ETH keys don't match`, {
        ethKeyInDB: ethKey.address,
        ethKeysInRegistry
      })
      return false
    }

    const rsaKey = await this.signerClient.getRSAKey()
    this.logger.info(`Obtained RSA key`)
    const rsaKeysInRegistry = currentCompanyData[0].komgoMessagingPubKeys
      .filter(item => item.key !== '')
      .map(item => JSON.parse(item.key))
    if (!rsaKeysInRegistry.find(key => isEqual(key, rsaKey))) {
      this.logger.crit(ErrorCode.ConfigurationOnbording, 'RsaKeysMismatch', `RSA keys don't match`, {
        rsaKeyInDb: rsaKey,
        rsaKeysInRegistry
      })
      return false
    }

    this.logger.info(`Checking keys validity for current kapsule complete`)
    return true
  }
}
