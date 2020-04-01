import { Web3Wrapper } from '@komgo/blockchain-access'
import { MessagingFactory } from '@komgo/messaging-library'
import { getRequestIdHandler } from '@komgo/microservice-config'
import { Container, inject, interfaces, decorate, injectable } from 'inversify'
import { autoProvide, makeProvideDecorator, makeFluentProvideDecorator } from 'inversify-binding-decorators'
import { Controller } from 'tsoa'
import Web3 from 'web3'

import AttributeUseCase from '../business-layer/attribute/AttributeUseCase'
import IAttributeUseCase from '../business-layer/attribute/IAttributeUseCase'
import { EventsProcessor } from '../business-layer/cache/EventsProcessor'
import { IEventsProcessor } from '../business-layer/cache/IEventsProcessor'
import CompanyUseCase from '../business-layer/company/CompanyUseCase'
import ICompanyUseCase from '../business-layer/company/ICompanyUseCase'
import EthPubKeyUseCase from '../business-layer/ethpubkey/EthPubKeyUseCase'
import { IEthPubKeyUseCase } from '../business-layer/ethpubkey/IEthPubKeyUseCase'
import { ITransactionSigner } from '../business-layer/transaction-signer/ITransactionSigner'
import TransactionSigner from '../business-layer/transaction-signer/TransactionSigner'
import { IMemberDAO } from '../data-layer/dao/IMemberDAO'
import { IRegistryEventManagerDAO } from '../data-layer/dao/IRegistryEventManagerDAO'
import AttributeDataAgent from '../data-layer/data-agents/AttributeDataAgent'
import { ABIChangedDataAgent } from '../data-layer/data-agents/cache/ABIChangedDataAgent'
import { AddrChangedDataAgent } from '../data-layer/data-agents/cache/AddrChangedDataAgent'
import { EthPubKeyAddedDataAgent } from '../data-layer/data-agents/cache/EthPubKeyAddedDataAgent'
import { EthPubKeyRevokedDataAgent } from '../data-layer/data-agents/cache/EthPubKeyRevokedDataAgent'
import { IEventDataAgent } from '../data-layer/data-agents/cache/IEventDataAgent'
import { IRegistryCacheDataAgent } from '../data-layer/data-agents/cache/IRegistryCacheDataAgent'
import { KomgoMessagingPubKeyAddedDataAgent } from '../data-layer/data-agents/cache/KomgoMessagingPubKeyAddedDataAgent'
import { KomgoMessagingPubKeyRevokedDataAgent } from '../data-layer/data-agents/cache/KomgoMessagingPubKeyRevokedDataAgent'
import { NewOwnerDataAgent } from '../data-layer/data-agents/cache/NewOwnerDataAgent'
import { NewResolverDataAgent } from '../data-layer/data-agents/cache/NewResolverDataAgent'
import { RegistryCacheDataAgent } from '../data-layer/data-agents/cache/RegistryCacheDataAgent'
import { ReverseNodeChangedDataAgent } from '../data-layer/data-agents/cache/ReverseNodeChangedDataAgent'
import { TextChangedDataAgent } from '../data-layer/data-agents/cache/TextChangedDataAgent'
import { TransferDataAgent } from '../data-layer/data-agents/cache/TransferDataAgent'
import { VaktMessagingPubKeyAddedDataAgent } from '../data-layer/data-agents/cache/VaktMessagingPubKeyAddedDataAgent'
import { VaktMessagingPubKeyRevokedDataAgent } from '../data-layer/data-agents/cache/VaktMessagingPubKeyRevokedDataAgent'
import CompanyDataAgent from '../data-layer/data-agents/CompanyDataAgent'
import EthPubKeyAgent from '../data-layer/data-agents/EthPubKeyAgent'
import { IAttributeDataAgent } from '../data-layer/data-agents/IAttributeDataAgent'
import { ICompanyDataAgent } from '../data-layer/data-agents/ICompanyDataAgent'
import { IEthPubKeyAgent } from '../data-layer/data-agents/IEthPubKeyAgent'
import { IRegistryEventProcessedDataAgent } from '../data-layer/data-agents/IRegistryEventProcessedDataAgent'
import { RegistryEventProcessedDataAgent } from '../data-layer/data-agents/RegistryEventProcessedDataAgent'
import { MemberDAOMongo } from '../data-layer/mongodb/MemberDAOMongo'
import { RegistryEventManagerDAOMongo } from '../data-layer/mongodb/RegistryEventManagerDAOMongo'
import ContractArtifacts from '../data-layer/smart-contracts/ContractArtifacts'
import { IContractArtifacts } from '../data-layer/smart-contracts/IContractArtifacts'
import BlockchainSignerClient from '../infrastructure/api-blockchain-signer/BlockchainSignerClient'
import SignerClient from '../infrastructure/api-signer/SignerClient'
import { CachePopulationStateHolder } from '../service-layer/cache/CachePopulationStateHolder'
import IRegistryCachePopulationService from '../service-layer/cache/IRegistryCachePopulationService'
import { RegistryCachePopulationService } from '../service-layer/cache/RegistryCachePopulationService'
import { CacheEventService } from '../service-layer/events/CacheEventService'
import DecoratorService from '../service-layer/events/DecoratorService'
import IService from '../service-layer/events/IService'
import IPollingServiceFactory from '../service-layer/IPollingServiceFactory'
import PollingServiceFactory from '../service-layer/PollingServiceFactory'

import { TYPES } from './types'

// 40 second web3 calls have been observed - 90 seconds gives a buffer
const WEB3_HTTP_TIMEOUT = 90000

const iocContainer = new Container()
const provide = makeProvideDecorator(iocContainer)
const fluentProvider = makeFluentProvideDecorator(iocContainer)

decorate(injectable(), Controller)

iocContainer.bind<IAttributeDataAgent>(TYPES.AttributeDataAgent).to(AttributeDataAgent)
iocContainer.bind<ICompanyDataAgent>(TYPES.CompanyDataAgent).to(CompanyDataAgent)
iocContainer.bind<IEthPubKeyAgent>(TYPES.EthPubKeyAgent).to(EthPubKeyAgent)
iocContainer.bind<IEthPubKeyUseCase>(TYPES.EthPubKeyUseCase).to(EthPubKeyUseCase)
iocContainer.bind<IAttributeUseCase>(TYPES.AttributeUseCase).to(AttributeUseCase)
iocContainer.bind<ICompanyUseCase>(TYPES.CompanyUseCase).to(CompanyUseCase)
iocContainer.bind<ITransactionSigner>(TYPES.TransactionSigner).to(TransactionSigner)

iocContainer.bind<IRegistryCacheDataAgent>(TYPES.RegistryCacheDataAgent).to(RegistryCacheDataAgent)
iocContainer.bind<IMemberDAO>(TYPES.MemberDAO).to(MemberDAOMongo)
iocContainer.bind<IRegistryEventManagerDAO>(TYPES.RegistryEventManagerDAO).to(RegistryEventManagerDAOMongo)
iocContainer.bind<IEventDataAgent>(TYPES.NewOwnerDataAgent).to(NewOwnerDataAgent)
iocContainer.bind<IEventDataAgent>(TYPES.TransferDataAgent).to(TransferDataAgent)
iocContainer.bind<IEventDataAgent>(TYPES.NewResolverDataAgent).to(NewResolverDataAgent)
iocContainer.bind<IEventDataAgent>(TYPES.AddrChangedDataAgent).to(AddrChangedDataAgent)
iocContainer.bind<IEventDataAgent>(TYPES.ABIChangedDataAgent).to(ABIChangedDataAgent)
iocContainer.bind<IEventDataAgent>(TYPES.EthPubKeyAddedDataAgent).to(EthPubKeyAddedDataAgent)
iocContainer.bind<IEventDataAgent>(TYPES.EthPubKeyRevokedDataAgent).to(EthPubKeyRevokedDataAgent)
iocContainer.bind<IEventDataAgent>(TYPES.KomgoMessagingPubKeyAddedDataAgent).to(KomgoMessagingPubKeyAddedDataAgent)
iocContainer.bind<IEventDataAgent>(TYPES.KomgoMessagingPubKeyRevokedDataAgent).to(KomgoMessagingPubKeyRevokedDataAgent)
iocContainer.bind<IEventDataAgent>(TYPES.VaktMessagingPubKeyAddedDataAgent).to(VaktMessagingPubKeyAddedDataAgent)
iocContainer.bind<IEventDataAgent>(TYPES.VaktMessagingPubKeyRevokedDataAgent).to(VaktMessagingPubKeyRevokedDataAgent)
iocContainer.bind<IEventDataAgent>(TYPES.TextChangedDataAgent).to(TextChangedDataAgent)
iocContainer.bind<IEventDataAgent>(TYPES.ReverseNodeChangedDataAgent).to(ReverseNodeChangedDataAgent)

iocContainer.bind<IEventsProcessor>(TYPES.EventsProcessor).to(EventsProcessor)
const web3Wrapper = new Web3Wrapper(undefined, undefined, WEB3_HTTP_TIMEOUT)
iocContainer.bind<Web3>(TYPES.Web3).toConstantValue(web3Wrapper.web3Instance)
iocContainer.bind<Web3Wrapper>(TYPES.Web3Wrapper).toConstantValue(web3Wrapper)

iocContainer.bind<IService>(TYPES.DecoratorService).to(DecoratorService)
iocContainer.bind<IService>(TYPES.CacheEventService).to(CacheEventService)
iocContainer
  .bind<IRegistryCachePopulationService>(TYPES.RegistryCachePopulationService)
  .to(RegistryCachePopulationService)
iocContainer
  .bind<IPollingServiceFactory>(TYPES.PollingServiceFactory)
  .to(PollingServiceFactory)
  .inSingletonScope()

iocContainer.bind<SignerClient>(TYPES.SignerClient).to(SignerClient)
iocContainer.bind<BlockchainSignerClient>(TYPES.BlockchainSignerClient).to(BlockchainSignerClient)

iocContainer.bind<IContractArtifacts>(TYPES.ContractArtifacts).to(ContractArtifacts)
iocContainer
  .bind(TYPES.MessagingFactory)
  .toConstantValue(
    new MessagingFactory(
      process.env.INTERNAL_MQ_HOST || 'rabbit2',
      process.env.INTERNAL_MQ_USERNAME || 'rabbitmq',
      process.env.INTERNAL_MQ_PASSWORD || 'rabbitmq',
      getRequestIdHandler()
    )
  )
iocContainer
  .bind<IRegistryEventProcessedDataAgent>(TYPES.RegistryEventProcessedDataAgent)
  .to(RegistryEventProcessedDataAgent)
iocContainer
  .bind<CachePopulationStateHolder>(TYPES.CachePopulationStateHolder)
  .to(CachePopulationStateHolder)
  .inSingletonScope()

iocContainer
  .bind<number>('internal-mq-polling-interval-ms')
  .toConstantValue(parseInt(process.env.INTERNAL_MQ_POLLING_INTERVAL_MS, 10) || 300)

iocContainer
  .bind<number>('prepopulation-chunk')
  .toConstantValue(parseInt(process.env.PREPOPULATION_BLOCKCHAIN_CHUNK, 10) || 10000)

iocContainer.bind<string>('consumer-id').toConstantValue(process.env.INTERNAL_MQ_CONSUMER_ID || 'api-registry-consumer')
iocContainer
  .bind<string>('from-publisher-id')
  .toConstantValue(process.env.INTERNAL_MQ_FROM_PUBLISHER_ID || 'from-event-mgnt')
iocContainer
  .bind<string>('komgoresolver-domain')
  .toConstantValue(process.env.ENS_RESOLVER_DOMAIN || 'komgoresolver.contract.komgo')
iocContainer
  .bind<string>('komgometaresolver-domain')
  .toConstantValue(process.env.ENS_META_RESOLVER_DOMAIN || 'komgometaresolver.contract.komgo')
iocContainer
  .bind<string>('komgoregistrar-domain')
  .toConstantValue(process.env.ENS_REGISTRAR_DOMAIN || 'komgoregistrar.contract.komgo')

// Constant values/variables
iocContainer.bind<string>('ens_registry_contract_address').toConstantValue(process.env.ENS_REGISTRY_CONTRACT_ADDRESS)
iocContainer.bind<string>('company-static-id').toConstantValue(process.env.COMPANY_STATIC_ID)
iocContainer
  .bind<string>('komgo_registrar_contract_address')
  .toConstantValue(process.env.KOMGO_REGISTRAR_CONTRACT_ADDRESS)

iocContainer.bind<string>('api-signer-url').toConstantValue(process.env.API_SIGNER_BASE_URL || 'http://api-signer')

iocContainer
  .bind<string>('api-blockchain-signer-url')
  .toConstantValue(process.env.API_BLOCKCHAIN_SIGNER_BASE_URL || 'http://api-blockchain-signer')

const provideNamed = (
  identifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>,
  name: string
) => {
  return fluentProvider(identifier)
    .whenTargetNamed(name)
    .done()
}

const provideSingleton = (identifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>) => {
  return fluentProvider(identifier)
    .inSingletonScope()
    .done()
}

export { iocContainer, autoProvide, provide, provideSingleton, provideNamed, inject }
