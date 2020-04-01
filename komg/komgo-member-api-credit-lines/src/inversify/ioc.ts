import { MessagingFactory } from '@komgo/messaging-library'
import { getRequestIdHandler } from '@komgo/microservice-config'
import { NotificationManager, TaskManager } from '@komgo/notification-publisher'
import { Container, decorate, inject, injectable, interfaces } from 'inversify'
import { autoProvide, makeProvideDecorator, makeFluentProvideDecorator } from 'inversify-binding-decorators'
import 'reflect-metadata'
import { Controller } from 'tsoa'

import { CompanyClient } from '../business-layer/clients/CompanyClient'
import { CounterpartyClient } from '../business-layer/clients/CounterpartyClient'
import { ICompanyClient } from '../business-layer/clients/ICompanyClient'
import { ICounterpartyClient } from '../business-layer/clients/ICounterpartyClient'
import { ICreditLineRequestService, CreditLineRequestService } from '../business-layer/CreditLineRequestService'
import CreditLineService, { ICreditLineService } from '../business-layer/CreditLineService'
import {
  CreditLineValidationFactory,
  ICreditLineValidationFactory
} from '../business-layer/CreditLineValidationFactory'
import {
  ICreditLineValidationService,
  CreditLineValidationService
} from '../business-layer/CreditLineValidationService'
import {
  IDepositLoanRequestService,
  DepositLoanRequestService
} from '../business-layer/deposit-loan/DepositLoanRequestService'
import DepositLoanService, { IDepositLoanService } from '../business-layer/deposit-loan/DepositLoanService'
import {
  IDepositLoanValidationService,
  DepositLoanValidationService
} from '../business-layer/deposit-loan/DepositLoanValidationService'
import { ShareDepositLoanService } from '../business-layer/deposit-loan/ShareDepositLoanService'
import RevokeEventProcessor from '../business-layer/messaging/processor/credit-line/RevokeEventProcessor'
import ShareEventProcessor from '../business-layer/messaging/processor/credit-line/ShareEventProcessor'
import CreditLineRequestDeclinedEventProcessor from '../business-layer/messaging/processor/CreditLineRequestDeclinedEventProcessor'
import CreditLineRequestEventProcessor from '../business-layer/messaging/processor/CreditLineRequestEventProcessor'
import DepositLoanRequestDeclinedEventProcessor from '../business-layer/messaging/processor/deposit-loan/DepositLoanRequestDeclinedEventProcessor'
import DepositLoanRequestEventProcessor from '../business-layer/messaging/processor/deposit-loan/DepositLoanRequestEventProcessor'
import RevokeDepositLoanEventProcessor from '../business-layer/messaging/processor/deposit-loan/RevokeDepositLoanEventProcessor'
import ShareDepositLoanEventProcessor from '../business-layer/messaging/processor/deposit-loan/ShareDepositLoanEventProcessor'
import { IEventProcessorBase } from '../business-layer/messaging/processor/IEventProcessor'
import { RequestClient } from '../business-layer/messaging/RequestClient'
import { INotificationFactory, NotificationFactory } from '../business-layer/notifications'
import { DepositLoanNotificationFactory } from '../business-layer/notifications/DepositLoanNotificationFactory'
import { NotificationClient } from '../business-layer/notifications/notifications/NotificationClient'
import { IRequestValidationService, RequestValidationService } from '../business-layer/RequestValidationService'
import { ShareCreditLineService } from '../business-layer/ShareCreditLineService'
import {
  CreditLineRequestTaskFactory,
  ICreditLineRequestTaskFactory
} from '../business-layer/tasks/CreditLineRequestTaskFactory'
import CreditLineDataAgent from '../data-layer/data-agents/CreditLineDataAgent'
import CreditLineRequestDataAgent from '../data-layer/data-agents/CreditLineRequestDataAgent'
import DepositLoanDataAgent from '../data-layer/data-agents/DepositLoanDataAgent'
import DepositLoanRequestDataAgent from '../data-layer/data-agents/DepositLoanRequestDataAgent'
import DisclosedCreditLineDataAgent from '../data-layer/data-agents/DisclosedCreditLineDataAgent'
import DisclosedDepositLoanDataAgent from '../data-layer/data-agents/DisclosedDepositLoanDataAgent'
import { ICreditLineDataAgent } from '../data-layer/data-agents/ICreditLineDataAgent'
import { ICreditLineRequestDataAgent } from '../data-layer/data-agents/ICreditLineRequestDataAgent'
import { IDepositLoanDataAgent } from '../data-layer/data-agents/IDepositLoanDataAgent'
import { IDepositLoanRequestDataAgent } from '../data-layer/data-agents/IDepositLoanRequestDataAgent'
import { IDisclosedCreditLineDataAgent } from '../data-layer/data-agents/IDisclosedCreditLineDataAgent'
import { IDisclosedDepositLoanDataAgent } from '../data-layer/data-agents/IDisclosedDepositLoanDataAgent'
import { ISharedCreditLineDataAgent } from '../data-layer/data-agents/ISharedCreditLineDataAgent'
import { ISharedDepositLoanDataAgent } from '../data-layer/data-agents/ISharedDepositLoanDataAgent'
import SharedCreditLineDataAgent from '../data-layer/data-agents/SharedCreditLineDataAgent'
import SharedDepositLoanDataAgent from '../data-layer/data-agents/SharedDepositLoanDataAgent'
import MessageProcessorService from '../service-layer/services/MessageProcessorService'

import { CONFIG } from './config'
import { BINDINGS } from './constants'
import { TYPES } from './types'

const iocContainer = new Container()
const provide = makeProvideDecorator(iocContainer)
const fluentProvider = makeFluentProvideDecorator(iocContainer)

decorate(injectable(), Controller)

const API_NOTIF_BASE_URL = process.env.API_NOTIF_BASE_URL || 'http://api-notif:8080'

iocContainer.bind<string>(CONFIG.NotifUrl).toConstantValue(API_NOTIF_BASE_URL)

iocContainer
  .bind<string>(CONFIG.CounterpartyUrl)
  .toConstantValue(process.env.API_COVERAGE_BASE_URL || 'http://api-coverage:8080')
iocContainer
  .bind<string>(CONFIG.RegistryUrl)
  .toConstantValue(process.env.API_REGISTRY_BASE_URL || 'http://api-registry:8080')

iocContainer
  .bind<string>(CONFIG.KapsuleUrl)
  .toConstantValue(process.env.ACCESS_CONTROL_ALLOW_ORIGIN || 'http://localhost:3010')

iocContainer.bind<string>(CONFIG.CompanyStaticId).toConstantValue(process.env.COMPANY_STATIC_ID)

iocContainer.bind<NotificationClient>(TYPES.NotificationClient).to(NotificationClient)

iocContainer
  .bind<NotificationManager>(TYPES.NotificationManagerClient)
  .toConstantValue(new NotificationManager(API_NOTIF_BASE_URL))

iocContainer.bind<RequestClient>(TYPES.RequestClient).to(RequestClient)

iocContainer.bind<ICreditLineDataAgent>(TYPES.CreditLineDataAgent).to(CreditLineDataAgent)
iocContainer.bind<IDepositLoanDataAgent>(TYPES.DepositLoanDataAgent).to(DepositLoanDataAgent)
iocContainer.bind<IDisclosedDepositLoanDataAgent>(TYPES.DisclosedDepositLoanDataAgent).to(DisclosedDepositLoanDataAgent)

iocContainer.bind<ISharedDepositLoanDataAgent>(TYPES.SharedDepositLoanDataAgent).to(SharedDepositLoanDataAgent)
iocContainer.bind<IDisclosedCreditLineDataAgent>(TYPES.DisclosedCreditLineDataAgent).to(DisclosedCreditLineDataAgent)
iocContainer.bind<ISharedCreditLineDataAgent>(TYPES.SharedCreditLineDataAgent).to(SharedCreditLineDataAgent)

iocContainer.bind<ICreditLineService>(TYPES.CreditLineService).to(CreditLineService)
iocContainer.bind<IDepositLoanService>(TYPES.DepositLoanService).to(DepositLoanService)
iocContainer.bind<ShareDepositLoanService>(TYPES.ShareDepositLoanService).to(ShareDepositLoanService)

iocContainer.bind<ICreditLineValidationService>(TYPES.CreditLineValidationService).to(CreditLineValidationService)
iocContainer.bind<IRequestValidationService>(TYPES.RequestValidationService).to(RequestValidationService)
iocContainer.bind<IDepositLoanValidationService>(TYPES.DepositLoanValidationService).to(DepositLoanValidationService)
iocContainer.bind<ShareCreditLineService>(TYPES.ShareCreditLineService).to(ShareCreditLineService)
iocContainer.bind<ICreditLineRequestDataAgent>(TYPES.CreditLineRequestDataAgent).to(CreditLineRequestDataAgent)
iocContainer.bind<ICreditLineRequestService>(TYPES.CreditLineRequestService).to(CreditLineRequestService)
iocContainer.bind<ICreditLineRequestTaskFactory>(TYPES.CreditLineRequestTaskFactory).to(CreditLineRequestTaskFactory)

iocContainer.bind<INotificationFactory>(TYPES.NotificationFactory).to(NotificationFactory)
iocContainer
  .bind<DepositLoanNotificationFactory>(TYPES.DepositLoanNotificationFactory)
  .to(DepositLoanNotificationFactory)

iocContainer.bind<TaskManager>(TYPES.TaskManagerClient).toConstantValue(new TaskManager(API_NOTIF_BASE_URL))

iocContainer.bind<ICreditLineValidationFactory>(TYPES.CreditLineValidationFactory).to(CreditLineValidationFactory)

iocContainer.bind<ICounterpartyClient>(TYPES.CounterpartyClient).to(CounterpartyClient)
iocContainer.bind<ICompanyClient>(TYPES.CompanyClient).to(CompanyClient)

iocContainer
  .bind<number>(BINDINGS.ConsumeRetryDelay)
  .toConstantValue(parseInt(process.env.CONSUME_RETRY_DELAY, 10) || 300)

iocContainer
  .bind<string>(BINDINGS.ConsumerId)
  .toConstantValue(process.env.INTERNAL_MQ_CONSUMER_ID || 'api-credit-lines')
iocContainer
  .bind<string>(BINDINGS.OutboundPublisher)
  .toConstantValue(process.env.INTERNAL_MQ_TO_PUBLISHER_ID || 'to-event-mgnt')
iocContainer
  .bind<string>(BINDINGS.InboundPublisher)
  .toConstantValue(process.env.INTERNAL_MQ_FROM_PUBLISHER_ID || 'from-event-mgnt')

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

iocContainer.bind<IEventProcessorBase>(TYPES.EventProcessor).to(ShareEventProcessor)
iocContainer.bind<IEventProcessorBase>(TYPES.EventProcessor).to(RevokeEventProcessor)
iocContainer.bind<IEventProcessorBase>(TYPES.EventProcessor).to(CreditLineRequestEventProcessor)
iocContainer.bind<IEventProcessorBase>(TYPES.EventProcessor).to(CreditLineRequestDeclinedEventProcessor)
iocContainer.bind<IEventProcessorBase>(TYPES.EventProcessor).to(DepositLoanRequestEventProcessor)
iocContainer.bind<IEventProcessorBase>(TYPES.EventProcessor).to(DepositLoanRequestDeclinedEventProcessor)

iocContainer.bind<IEventProcessorBase>(TYPES.EventProcessor).to(ShareDepositLoanEventProcessor)
iocContainer.bind<IEventProcessorBase>(TYPES.EventProcessor).to(RevokeDepositLoanEventProcessor)

iocContainer.bind<IDepositLoanRequestDataAgent>(TYPES.DepositLoanRequestDataAgent).to(DepositLoanRequestDataAgent)
iocContainer.bind<IDepositLoanRequestService>(TYPES.DepositLoanRequestService).to(DepositLoanRequestService)

iocContainer.bind<MessageProcessorService>(TYPES.MessageProcessorService).to(MessageProcessorService)

const provideSingleton = (identifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>) => {
  return fluentProvider(identifier)
    .inSingletonScope()
    .done()
}

export { iocContainer, autoProvide, provide, provideSingleton, inject }
