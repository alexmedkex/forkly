import { Web3Wrapper } from '@komgo/blockchain-access'
import { MessagingFactory } from '@komgo/messaging-library'
import { getRequestIdHandler } from '@komgo/microservice-config'
import { NotificationManager } from '@komgo/notification-publisher'
import { Container, decorate, inject, injectable, interfaces } from 'inversify'
import { autoProvide, makeFluentProvideDecorator, makeProvideDecorator } from 'inversify-binding-decorators'
import 'reflect-metadata'
import { Controller } from 'tsoa'

import CompanyDataAgent, { ICompanyDataAgent } from '../data-layer/data-agent/CompanyDataAgent'
import CompanyRegistryService, { ICompanyRegistryService } from '../infrastructure/api-registry/CompanyRegistryService'
import UsersService, { IUsersService } from '../infrastructure/api-users/UsersService'
import CommonMessagingService from '../infrastructure/common-broker/CommonMessagingService'
import ICommonMessagingService from '../infrastructure/common-broker/ICommonMessagingService'
import HarborService, { IHarborService } from '../infrastructure/harbor/HarborService'
import { ContractArtifacts } from '../utils/contract-artifacts'

import { TYPES } from './types'

const iocContainer = new Container()
const provide = makeProvideDecorator(iocContainer)
const fluentProvider = makeFluentProvideDecorator(iocContainer)

decorate(injectable(), Controller)

iocContainer.bind<ICompanyDataAgent>(TYPES.CompanyDataAgent).to(CompanyDataAgent)
iocContainer
  .bind<string>('ens-registry-contract-address')
  .toConstantValue(process.env.ENS_REGISTRY_CONTRACT_ADDRESS || '')

iocContainer.bind<IUsersService>(TYPES.UsersService).to(UsersService)
iocContainer.bind<ICompanyRegistryService>(TYPES.CompanyRegistryService).to(CompanyRegistryService)
iocContainer.bind<IHarborService>(TYPES.HarborService).to(HarborService)
iocContainer.bind<string>(TYPES.MonitoringDevEnv).toConstantValue(process.env.MONITORING_DEPLOYMENT_ENVIRONMENT)
iocContainer.bind(TYPES.Web3Wrapper).toConstantValue(new Web3Wrapper().web3Instance)

iocContainer.bind<string>(TYPES.ApiUsersBaseUrl).toConstantValue(process.env.API_USERS_BASE_URL)
iocContainer.bind<string>(TYPES.ApiRegistryBaseUrl).toConstantValue(process.env.API_REGISTRY_BASE_URL)
iocContainer
  .bind<NotificationManager>(TYPES.NotificationManager)
  .toConstantValue(new NotificationManager(process.env.API_NOTIF_BASE_URL))
iocContainer.bind<string>(TYPES.EnsAddress).toConstantValue(process.env.ENS_REGISTRY_CONTRACT_ADDRESS)
iocContainer.bind<string>(TYPES.HarborUrl).toConstantValue(process.env.HARBOR_URL)
iocContainer.bind<string>(TYPES.HarborProjectId).toConstantValue(process.env.HARBOR_PROJECT_ID)
iocContainer.bind<string>(TYPES.HarborAdminName).toConstantValue(process.env.HARBOR_ADMIN_USERNAME)
iocContainer.bind<string>(TYPES.HarborAdminPass).toConstantValue(process.env.HARBOR_ADMIN_PASSWORD)
iocContainer
  .bind(TYPES.ContractArtifacts)
  .toDynamicValue(
    context => new ContractArtifacts(iocContainer.get(TYPES.EnsAddress), iocContainer.get(TYPES.Web3Wrapper))
  )

iocContainer
  .bind<string>('common-mq-base-url')
  .toConstantValue(process.env.COMMON_MQ_BASE_URL || 'http://komgo-common-mq-node-1:15672')
iocContainer.bind<string>('common-mq-username').toConstantValue(process.env.COMMON_MQ_USERNAME || 'rabbitmq')
iocContainer.bind<string>('common-mq-password').toConstantValue(process.env.COMMON_MQ_PASSWORD || 'rabbitmq')
iocContainer
  .bind<number>('max-content-length')
  .toConstantValue(parseInt(process.env.REQUEST_MAX_CONTENT_LENGTH_BYTES, 10) || 1073741824)
iocContainer.bind<number>('request-timeout').toConstantValue(parseInt(process.env.REQUEST_TIMEOUT, 10) || 60000)
iocContainer
  .bind<ICommonMessagingService>(TYPES.CommonMessagingService)
  .to(CommonMessagingService)
  .inSingletonScope()
iocContainer
  .bind(TYPES.MessagePublisher)
  .toConstantValue(
    new MessagingFactory(
      process.env.INTERNAL_MQ_HOST,
      process.env.INTERNAL_MQ_USERNAME,
      process.env.INTERNAL_MQ_PASSWORD,
      getRequestIdHandler()
    ).createPublisher('websocket')
  )

const provideSingleton = (identifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>) => {
  return fluentProvider(identifier)
    .inSingletonScope()
    .done()
}

export { iocContainer, autoProvide, provide, provideSingleton, inject }
