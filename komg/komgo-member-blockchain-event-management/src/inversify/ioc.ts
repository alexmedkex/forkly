import { Web3Wrapper } from '@komgo/blockchain-access'
import { MessagingFactory } from '@komgo/messaging-library'
import express from 'express'
import { Server as HttpServer } from 'http'
import { Container } from 'inversify'
import 'reflect-metadata'
import Web3 from 'web3'

import { CompanyRegistryClient } from '../business-layer/auto-whitelist/CompanyRegistryClient'
import { PrivateAutoWhitelister } from '../business-layer/auto-whitelist/PrivateAutoWhitelister'
import PublicAutoWhitelister from '../business-layer/auto-whitelist/PublicAutoWhitelister'
import { QuorumClient } from '../business-layer/blockchain/QuorumClient'
import BytecodeVerifier from '../business-layer/events-validation/BytecodeVerifier'
import ContractCastVerifier from '../business-layer/events-validation/ContractCastVerifier'
import EventValidator from '../business-layer/events-validation/EventValidator'
import {
  LightContractLibraryDataAgent,
  EventProcessedDataAgent,
  IContractLibraryDataAgent,
  ContractAddressDataAgent,
  AutoWhitelistDataAgent
} from '../data-layer/data-agents'
import { ILightContractLibrary } from '../data-layer/models/light-contract-library'
import { createLightContractLibrary } from '../data-layer/models/light-contract-library/utils'
import { Server } from '../Server'
import BlockchainEventService from '../service-layer/BlockchainEventService'
import IService from '../service-layer/IService'
import PollingServiceFactory from '../service-layer/PollingServiceFactory'
import PrivateAutoWhitelistService from '../service-layer/PrivateAutoWhitelistService'
import PublicAutoWhitelistService from '../service-layer/PublicAutoWhitelistService'
import RunnerService from '../service-layer/RunnerService'
import IIsReadyChecker from '../util/IIsReadyChecker'
import IsReadyChecker from '../util/IsReadyChecker'
import requestIdHandlerInstance, { RequestIdHandler } from '../util/RequestIdHandler'

import { TYPES } from './types'
import { getArrayFromEnvVariable } from './utils'
import { VALUES } from './values'

const iocContainer = new Container()

// Web3
const web3Wrapper = new Web3Wrapper()
const web3Instance = web3Wrapper.web3Instance
iocContainer.bind<Web3>(TYPES.Web3Instance).toConstantValue(web3Instance)
iocContainer.bind<string>(VALUES.BlockchainURL).toConstantValue(web3Wrapper.createBlockchainUrl())

// Values
iocContainer
  .bind<number>(VALUES.QuorumHTTPTimeout)
  .toConstantValue(parseInt(process.env.QUORUM_HTTP_TIMEOUT, 10) || 10000)
iocContainer.bind<string>(VALUES.HTTPProxy).toConstantValue(process.env.HTTP_PROXY)
iocContainer.bind<string>(VALUES.HTTPSProxy).toConstantValue(process.env.HTTPS_PROXY)
iocContainer
  .bind<ILightContractLibrary>(VALUES.LightContractLibrary)
  .toConstantValue(createLightContractLibrary(web3Instance))
iocContainer
  .bind<number>(VALUES.AutoWhitelistBeforeBlock)
  .toConstantValue(parseInt(process.env.AUTO_WHITELIST_BEFORE_BLOCK, 10) || 0)
iocContainer
  .bind<string>(VALUES.PublisherId)
  .toConstantValue(process.env.INTERNAL_MQ_FROM_PUBLISHER_ID || 'from-event-mgnt')
iocContainer
  .bind<number>(VALUES.PollingIntervalMs)
  .toConstantValue(parseInt(process.env.BLOCKCHAIN_POLLING_INTERVAL_MS, 10) || 1000)
iocContainer
  .bind<number>(VALUES.MaxRequestPerSecond)
  .toConstantValue(parseInt(process.env.BLOCKCHAIN_MAX_REQUESTS_PER_SECOND, 10) || 5)
iocContainer
  .bind<number>(VALUES.AutoWhitelistChunkSize)
  .toConstantValue(parseInt(process.env.PREPOPULATION_BLOCKCHAIN_CHUNK, 10) || 10000)
iocContainer.bind<RequestIdHandler>(VALUES.RequestIdHandler).toConstantValue(requestIdHandlerInstance)
iocContainer
  .bind<string>(VALUES.ApiRegistryBaseURL)
  .toConstantValue(process.env.API_REGISTRY_BASE_URL || 'http://api-registry:8080')

// Domain names of contracts in ENS to auto whitelist
iocContainer.bind<string>(VALUES.ENSRegistryContractAddress).toConstantValue(process.env.ENS_REGISTRY_CONTRACT_ADDRESS)
iocContainer
  .bind<string[]>(VALUES.KomgoContractDomains)
  .toConstantValue(
    getArrayFromEnvVariable(process.env.KOMGO_CONTRACT_DOMAINS, [
      'documentregistry.contract.komgo',
      'komgometaresolver.contract.komgo',
      'komgoresolver.contract.komgo',
      'komgoregistrar.contract.komgo'
    ])
  )

// Types
iocContainer
  .bind<EventProcessedDataAgent>(TYPES.EventProcessedDataAgent)
  .to(EventProcessedDataAgent)
  .inSingletonScope()
iocContainer
  .bind<IContractLibraryDataAgent>(TYPES.ContractLibraryDataAgent)
  .to(LightContractLibraryDataAgent)
  .inSingletonScope()
iocContainer
  .bind<ContractAddressDataAgent>(TYPES.ContractAddressDataAgent)
  .to(ContractAddressDataAgent)
  .inSingletonScope()
iocContainer.bind<CompanyRegistryClient>(TYPES.CompanyRegistryClient).to(CompanyRegistryClient)
iocContainer.bind<QuorumClient>(TYPES.QuorumClient).to(QuorumClient)
iocContainer
  .bind<AutoWhitelistDataAgent>(TYPES.AutoWhitelistDataAgent)
  .to(AutoWhitelistDataAgent)
  .inSingletonScope()
iocContainer
  .bind<IService>(TYPES.RunnerService)
  .to(RunnerService)
  .inSingletonScope()
iocContainer
  .bind<PollingServiceFactory>(TYPES.PollingServiceFactory)
  .to(PollingServiceFactory)
  .inSingletonScope()
iocContainer
  .bind<IService>(TYPES.BlockchainEventService)
  .to(BlockchainEventService)
  .inSingletonScope()
iocContainer
  .bind<IIsReadyChecker>(TYPES.IsReadyChecker)
  .to(IsReadyChecker)
  .inSingletonScope()
iocContainer
  .bind<EventValidator>(TYPES.EventValidator)
  .to(EventValidator)
  .inSingletonScope()
iocContainer
  .bind<BytecodeVerifier>(TYPES.BytecodeVerifier)
  .to(BytecodeVerifier)
  .inSingletonScope()
iocContainer
  .bind<ContractCastVerifier>(TYPES.ContractCastVerifier)
  .to(ContractCastVerifier)
  .inSingletonScope()
iocContainer
  .bind<PublicAutoWhitelistService>(TYPES.PublicAutoWhitelistService)
  .to(PublicAutoWhitelistService)
  .inSingletonScope()
iocContainer.bind<PublicAutoWhitelister>(TYPES.PublicAutoWhitelister).to(PublicAutoWhitelister)
iocContainer
  .bind<PrivateAutoWhitelister>(TYPES.PrivateAutoWhitelister)
  .to(PrivateAutoWhitelister)
  .inSingletonScope()
iocContainer
  .bind<PrivateAutoWhitelistService>(TYPES.PrivateAutoWhitelistService)
  .to(PrivateAutoWhitelistService)
  .inSingletonScope()

// External dependencies
iocContainer
  .bind(TYPES.MessagingFactory)
  .toConstantValue(
    new MessagingFactory(
      process.env.INTERNAL_MQ_HOST || 'komgo-internal-mq-node-1',
      process.env.INTERNAL_MQ_USERNAME || 'rabbitmq',
      process.env.INTERNAL_MQ_PASSWORD || 'rabbitmq',
      requestIdHandlerInstance
    )
  )

iocContainer.bind<Server>(TYPES.Server).to(Server)
iocContainer.bind<express.Express>(TYPES.Express).toConstantValue(express())
iocContainer
  .bind<HttpServer>(TYPES.HttpServer)
  .toConstantValue(new HttpServer(iocContainer.get<express.Express>(TYPES.Express)))

export { iocContainer }
