import { Web3Wrapper } from '@komgo/blockchain-access'
import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'
import Web3 from 'web3'

import { IRegistryCacheDataAgent } from '../../data-layer/data-agents/cache/IRegistryCacheDataAgent'
import { IRegistryEventProcessedDataAgent } from '../../data-layer/data-agents/IRegistryEventProcessedDataAgent'
import { IContractArtifacts } from '../../data-layer/smart-contracts/IContractArtifacts'
import { EventValidationException } from '../../exceptions'
import BlockchainConnectionException from '../../exceptions/BlockchainConnectionException'
import { ErrorNames } from '../../exceptions/utils'
import { TYPES } from '../../inversify/types'

import { IEventsProcessor } from './IEventsProcessor'

const web3 = require('web3')

@injectable()
export class EventsProcessor implements IEventsProcessor {
  private logger = getLogger('EventsProcessor')
  private registryCacheDataAgent: IRegistryCacheDataAgent
  private eventProcessedDataAgent: IRegistryEventProcessedDataAgent
  private allowedAddresses: string[]
  private web3Instance: Web3

  constructor(
    @inject(TYPES.Web3Wrapper) private readonly web3Wrapper: Web3Wrapper | any,
    @inject(TYPES.ContractArtifacts) private artifacts: IContractArtifacts | any,
    @inject(TYPES.RegistryCacheDataAgent) registryDataAgent: IRegistryCacheDataAgent | any,
    @inject(TYPES.RegistryEventProcessedDataAgent) eventProcessedDataAgent: IRegistryEventProcessedDataAgent
  ) {
    this.registryCacheDataAgent = registryDataAgent
    this.eventProcessedDataAgent = eventProcessedDataAgent
    this.web3Instance = web3Wrapper.web3Instance
  }

  async processEventsBatch(from: number, to: number): Promise<any> {
    const eventsMappings = await this.getEventMappings()

    const fromHex = web3.utils.toHex(from)
    const toHex = web3.utils.toHex(to)
    let pastLogs
    try {
      this.logger.info(`Getting past logs from blockchain`, this.blockRange(from, to))
      pastLogs = await this.web3Instance.eth.getPastLogs({
        fromBlock: fromHex,
        toBlock: toHex
      })
      this.logger.info(`Got past logs from blockchain`, this.blockRange(from, to))
    } catch (error) {
      this.logger.error(
        ErrorCode.BlockchainConnection,
        ErrorNames.BlockchainConnectionError,
        error.message,
        {
          fromBlock: from,
          toBlock: to
        },
        new Error().stack
      )
      throw new BlockchainConnectionException('Failed to connect to blockchain.')
    }

    this.logger.info(`Procesing events in block range`, this.blockRange(from, to))
    await this.processEvents(eventsMappings, pastLogs)
    this.logger.info(`Completed processing events in block range`, this.blockRange(from, to))

    const lastEventProcessed = await this.eventProcessedDataAgent.getLastEventProcessed()
    let lastBlockProcessed = 0
    if (lastEventProcessed) {
      lastBlockProcessed = lastEventProcessed.blockNumber
    }
    this.logger.info(`Getting latest blockchain blockNumber`)
    const lastBlockInBlockchain = await this.web3Instance.eth.getBlockNumber()
    this.logger.info(`Got latest blockchain blockNumber`, { lastBlockInBlockchain })
    let serviceStarted = false

    if (lastBlockProcessed === lastBlockInBlockchain) {
      serviceStarted = true
    }
    return this.createResponse(from, to, lastBlockProcessed, lastBlockInBlockchain, serviceStarted)
  }

  async getDeployedContracts(): Promise<any[]> {
    let deployedContracts
    this.logger.info('Getting deployed Contracts')
    const ensRegistryDeployed = await this.artifacts.ensRegistry()
    const komgoResolverDeployed = await this.artifacts.komgoResolver()
    const komgoMetaResolverDeployed = await this.artifacts.komgoMetaResolver()
    deployedContracts = [ensRegistryDeployed, komgoResolverDeployed, komgoMetaResolverDeployed]
    this.allowedAddresses = deployedContracts.map(contract => contract.address.toLowerCase())
    this.logger.info('Got deployed contracts')
    return deployedContracts
  }

  async processEvent(event: any): Promise<any> {
    const eventsMappings = await this.getEventMappings()
    await this.processEvents(eventsMappings, [event])
  }

  private async getEventMappings() {
    const deployedContracts = await this.getDeployedContracts()
    return this.web3Wrapper.buildEventsMapping(deployedContracts)
  }

  private async processEvents(eventsMapping: any, events: any[]) {
    const disallowedContractErrorMap = {}
    for (const event of events) {
      const contractAddress = event.address.toLowerCase()
      if (this.allowedAddresses.indexOf(contractAddress) === -1) {
        let errorCount = disallowedContractErrorMap[contractAddress]
        disallowedContractErrorMap[contractAddress] = errorCount !== undefined ? ++errorCount : 1
        continue
      }

      let eventDecoded
      try {
        eventDecoded = this.web3Wrapper.decodeEvent(eventsMapping, event.data, event.topics)
      } catch (error) {
        this.logger.error(
          ErrorCode.BlockchainEventValidation,
          ErrorNames.EventValidationFailed,
          error.message,
          {
            eventData: event.data,
            eventTopics: event.topics
          },
          new Error().stack
        )
        throw new EventValidationException('Failed to decode blockchain event.')
      }
      await this.registryCacheDataAgent.saveSingleEvent(eventDecoded)
      await this.eventProcessedDataAgent.createOrUpdate(event.blockNumber, event.transactionIndex, event.logIndex)
    }
    if (Object.keys(disallowedContractErrorMap).length !== 0) {
      this.logger.warn(
        ErrorCode.BlockchainEventValidation,
        ErrorNames.EventAddressNotAllowed,
        `Event was emitted from an address that is not included in allowed addresses`,
        { disallowedContractErrorMap, allowedAddresses: this.allowedAddresses }
      )
    }
  }

  private blockRange(from: number, to: number): any {
    return { startBlock: from, endBlock: to }
  }

  private createResponse(
    from: number,
    to: number,
    lastBlockProcessed: number,
    lastBlockInBlockchain: number,
    serviceStarted: boolean
  ): any {
    return Object.seal({
      startBlock: from,
      endBlock: to,
      lastBlockProcessed,
      lastBlockchainBlock: lastBlockInBlockchain,
      serviceStarted
    })
  }
}
