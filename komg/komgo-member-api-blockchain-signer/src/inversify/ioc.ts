import { Web3Wrapper } from '@komgo/blockchain-access'
import DataAccess from '@komgo/data-access'
import { CheckerInstance } from '@komgo/health-check'
import { MessagingFactory } from '@komgo/messaging-library'
import { getRequestIdHandler } from '@komgo/microservice-config'
import { HDNode, utils } from 'ethers'
import { Container, decorate, inject, injectable, interfaces } from 'inversify'
import { makeFluentProvideDecorator } from 'inversify-binding-decorators'
import { Controller } from 'tsoa'
import Web3 from 'web3'

import ContentionManager from '../business-layer/contention/ContentionManager'
import CompanyKeyProvider from '../business-layer/key-management/CompanyKeyProvider'
import { ETHKeyManager } from '../business-layer/key-management/ETHKeyManager'
import KeyMigration from '../business-layer/migration/KeyMigration'
import OneTimeSigner from '../business-layer/one-time-key/OneTimeSigner'
import MessagingClient from '../business-layer/transactions/MessagingClient'
import TransactionManager from '../business-layer/transactions/TransactionManager'
import Web3Utils from '../business-layer/transactions/Web3Utils'
import AddrIndexDataAgent from '../data-layer/data-agents/AddrIndexDataAgent'
import KeyDataAgent from '../data-layer/data-agents/KeyDataAgent'
import TransactionDataAgent from '../data-layer/data-agents/TransactionDataAgent'
import VaultClient from '../infrastructure/vault/VaultClient'
import IService from '../service-layer/services/IService'
import LifecycleManagementService from '../service-layer/services/LifecycleManagementService'
import PollingServiceFactory from '../service-layer/services/PollingServiceFactory'
import TransactionSendService from '../service-layer/services/TransactionSendService'

import { CONFIG_KEYS } from './config_keys'
import { TYPES } from './types'
import { INJECTED_VALUES } from './values'

const iocContainer = new Container()
const fluentProvider = makeFluentProvideDecorator(iocContainer)

decorate(injectable(), Controller)

// Web3
const web3Wrapper = new Web3Wrapper()
iocContainer.bind<Web3>(INJECTED_VALUES.Web3Instance).toConstantValue(web3Wrapper.web3Instance)
iocContainer.bind<Web3Utils>(TYPES.Web3Utils).to(Web3Utils)

// Injected values
iocContainer
  .bind<string>(INJECTED_VALUES.PublisherId)
  .toConstantValue(process.env.INTERNAL_MQ_PUBLISHER_ID || 'api-blockchain-signer')
iocContainer
  .bind<number>(INJECTED_VALUES.TxRetryIntervalMs)
  .toConstantValue(parseInt(process.env.TRANSACTION_RETRY_INTERVAL_MS, 10) || 5000)
iocContainer
  .bind<number>(INJECTED_VALUES.MaxTransactionAttempts)
  .toConstantValue(parseInt(process.env.TRANSACTION_MAX_ATTEMPTS, 10) || 3)
iocContainer
  .bind<string>(INJECTED_VALUES.Mnemonic)
  .toConstantValue(process.env.MNEMONIC || HDNode.entropyToMnemonic(utils.randomBytes(16)))
iocContainer
  .bind<number>(INJECTED_VALUES.TxGasLimit)
  .toConstantValue(parseInt(process.env.TRANSACTION_GAS_LIMIT, 10) || 20000000)

iocContainer.bind<string>(CONFIG_KEYS.vaultRoleId).toConstantValue(process.env.API_BLOCKCHAIN_SIGNER_VAULT_ROLE_ID)
iocContainer.bind<string>(CONFIG_KEYS.vaultSecretId).toConstantValue(process.env.API_BLOCKCHAIN_SIGNER_VAULT_SECRET_ID)
iocContainer.bind<string>(CONFIG_KEYS.apiVersion).toConstantValue(process.env.VAULT_API_VERSION || 'v1')
iocContainer.bind<string>(CONFIG_KEYS.vaultUrl).toConstantValue(process.env.VAULT_BASE_URL)

iocContainer
  .bind(TYPES.VaultClient)
  .toConstantValue(
    new VaultClient(
      process.env.VAULT_BASE_URL,
      process.env.API_BLOCKCHAIN_SIGNER_VAULT_ROLE_ID,
      process.env.API_BLOCKCHAIN_SIGNER_VAULT_SECRET_ID,
      'v1'
    )
  )

// Business layer
iocContainer
  .bind<ETHKeyManager>(TYPES.ETHKeyManager)
  .to(ETHKeyManager)
  .inSingletonScope()
iocContainer
  .bind<KeyMigration>(TYPES.KeyMigration)
  .to(KeyMigration)
  .inSingletonScope()
iocContainer
  .bind<CompanyKeyProvider>(TYPES.CompanyKeyProvider)
  .to(CompanyKeyProvider)
  .inSingletonScope()
iocContainer
  .bind<TransactionManager>(TYPES.TransactionManager)
  .to(TransactionManager)
  .inSingletonScope()
iocContainer
  .bind<OneTimeSigner>(TYPES.OneTimeSigner)
  .to(OneTimeSigner)
  .inSingletonScope()
iocContainer
  .bind<MessagingClient>(TYPES.MessagingClient)
  .to(MessagingClient)
  .inSingletonScope()
iocContainer
  .bind<ContentionManager>(TYPES.BlockchainContentionManager)
  .toConstantValue(new ContentionManager(parseInt(process.env.CONTENTION_BC_MAX_CONCURRENCY, 10) || 2))

// Data layer
iocContainer
  .bind<TransactionDataAgent>(TYPES.TransactionDataAgent)
  .to(TransactionDataAgent)
  .inSingletonScope()
iocContainer
  .bind<AddrIndexDataAgent>(TYPES.AddrIndexDataAgent)
  .to(AddrIndexDataAgent)
  .inRequestScope()
iocContainer
  .bind<KeyDataAgent>(TYPES.KeyDataAgent)
  .to(KeyDataAgent)
  .inSingletonScope()

// Services
iocContainer
  .bind<IService>(TYPES.DecoratorService)
  .to(LifecycleManagementService)
  .inSingletonScope()
iocContainer
  .bind<IService>(TYPES.TransactionSendService)
  .to(TransactionSendService)
  .inSingletonScope()
iocContainer
  .bind<PollingServiceFactory>(TYPES.PollingServiceFactory)
  .to(PollingServiceFactory)
  .inSingletonScope()

// External dependencies
iocContainer
  .bind(TYPES.MessagingFactory)
  .toConstantValue(
    new MessagingFactory(
      process.env.INTERNAL_MQ_HOST || 'komgo-internal-mq-node-1',
      process.env.INTERNAL_MQ_USERNAME || 'rabbitmq',
      process.env.INTERNAL_MQ_PASSWORD || 'rabbitmq',
      getRequestIdHandler()
    )
  )

iocContainer.bind(TYPES.HealthChecker).toConstantValue(CheckerInstance)

iocContainer.bind(TYPES.DataAccess).toConstantValue(DataAccess)

const provideSingleton = (identifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>) => {
  return fluentProvider(identifier)
    .inSingletonScope()
    .done()
}

export { iocContainer, provideSingleton, inject }
