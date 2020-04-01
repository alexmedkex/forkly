import DataAccess from '@komgo/data-access'
import { CheckerInstance } from '@komgo/health-check'
import { MessagingFactory } from '@komgo/messaging-library'
import { getRequestIdHandler } from '@komgo/microservice-config'
import { AxiosInstance } from 'axios'
import { Container, decorate, inject, injectable, interfaces } from 'inversify'
import { autoProvide, makeFluentProvideDecorator, makeProvideDecorator } from 'inversify-binding-decorators'
import 'reflect-metadata'
import { Controller } from 'tsoa'

import { ActionFactory } from '../business-layer/actions/ActionFactory'
import { OutboundActionProcessor } from '../business-layer/actions/OutboundActionProcessor'
import CompanyRegistryClient from '../business-layer/company-registry/CompanyRegistryClient'
import { GetActionsUseCase } from '../business-layer/GetActionsUseCase'
import ReceiveInboundCorporateReplyUseCase from '../business-layer/inbound-actions/corporate/ReceiveInboundCorporateReplyUseCase'
import { ReceiveInboundAcceptUseCase } from '../business-layer/inbound-actions/financial-institution/ReceiveInboundAcceptUseCase'
import { ReceiveInboundDeclineUseCase } from '../business-layer/inbound-actions/financial-institution/ReceiveInboundDeclineUseCase'
import ReceiveInboundRequestUseCase from '../business-layer/inbound-actions/financial-institution/ReceiveInboundRequestUseCase'
import InboundUseCaseFactory from '../business-layer/inbound-actions/InboundUseCaseFactory'
import InternalMessageFactory from '../business-layer/messaging/InternalMessageFactory'
import InternalPublisher from '../business-layer/messaging/InternalPublisher'
import OutboundMessageFactory from '../business-layer/messaging/OutboundMessageFactory'
import OutboundPublisher from '../business-layer/messaging/OutboundPublisher'
import { AutoDeclineUseCase } from '../business-layer/outbound-actions/corporate/AutoDeclineUseCase'
import { CreateAcceptUseCase } from '../business-layer/outbound-actions/corporate/CreateAcceptUseCase'
import { CreateDeclineUseCase } from '../business-layer/outbound-actions/corporate/CreateDeclineUseCase'
import { CreateRequestUseCase } from '../business-layer/outbound-actions/corporate/CreateRequestUseCase'
import SendOutboundRequestUseCase from '../business-layer/outbound-actions/corporate/SendOutboundRequestUseCase'
import { CreateFinancialInstitutionReplyUseCase } from '../business-layer/outbound-actions/finanical-institution/CreateFinancialInstitutionReplyUseCase'
import { ReplyUseCase } from '../business-layer/outbound-actions/finanical-institution/ReplyUseCase'
import SendOutboundReplyUseCase from '../business-layer/outbound-actions/SendOutboundReplyUseCase'
import { RFPValidator } from '../business-layer/validation/RFPValidator'
import { ActionDataAgent } from '../data-layer/data-agents/ActionDataAgent'
import { RequestForProposalDataAgent } from '../data-layer/data-agents/RequestForProposalDataAgent'
import InboundProcessorService from '../service-layer/services/InboundProcessorService'
import { createRetryingAxios } from '../service-layer/utils/axiosRetryFactory'

import { TYPES } from './types'
import { VALUES } from './values'

const iocContainer = new Container()
const provide = makeProvideDecorator(iocContainer)
const fluentProvider = makeFluentProvideDecorator(iocContainer)

decorate(injectable(), Controller)

iocContainer.bind(TYPES.HealthChecker).toConstantValue(CheckerInstance)
iocContainer.bind(TYPES.DataAccess).toConstantValue(DataAccess)

// Values
iocContainer.bind<number>(VALUES.PublishMaxRetries).toConstantValue(parseInt(process.env.PUBLISH_MAX_RETRIES, 10) || 3)
iocContainer.bind<number>(VALUES.PublishMaxDelay).toConstantValue(parseInt(process.env.PUBLISH_MAX_DELAY, 10) || 300)
iocContainer
  .bind<number>(VALUES.InboundConsumeRetryDelay)
  .toConstantValue(parseInt(process.env.INBOUND_CONSUME_RETRY_DELAY, 10) || 300)
iocContainer
  .bind<string>(VALUES.OutboundPublisherId)
  .toConstantValue(process.env.OUTBOUND_PUBLISHER_ID || 'to-event-mgnt')
iocContainer
  .bind<string>(VALUES.InboundPublisherId)
  .toConstantValue(process.env.INBOUND_PUBLISHER_ID || 'from-event-mgnt')
iocContainer
  .bind<string>(VALUES.InboundConsumerId)
  .toConstantValue(process.env.INBOUND_CONSUMER_ID || 'api-rfp-inbound')
iocContainer.bind<string>(VALUES.InternalPublisherId).toConstantValue(process.env.INTERNAL_PUBLISHER_ID || 'rfp')
iocContainer.bind<string>(VALUES.CompanyStaticId).toConstantValue(process.env.COMPANY_STATIC_ID)
iocContainer.bind<string>(VALUES.ApiRegistryBaseURL).toConstantValue(process.env.API_REGISTRY_BASE_URL)

// Business layer
iocContainer
  .bind<CreateRequestUseCase>(TYPES.CreateRequestUseCase)
  .to(CreateRequestUseCase)
  .inSingletonScope()
iocContainer
  .bind<CreateFinancialInstitutionReplyUseCase>(TYPES.CreateFinancialInstitutionReplyUseCase)
  .to(CreateFinancialInstitutionReplyUseCase)
  .inSingletonScope()
iocContainer
  .bind<CreateAcceptUseCase>(TYPES.CreateAcceptUseCase)
  .to(CreateAcceptUseCase)
  .inSingletonScope()
iocContainer
  .bind<SendOutboundRequestUseCase>(TYPES.SendOutboundRequestUseCase)
  .to(SendOutboundRequestUseCase)
  .inSingletonScope()
iocContainer
  .bind<SendOutboundReplyUseCase>(TYPES.SendOutboundReplyUseCase)
  .to(SendOutboundReplyUseCase)
  .inSingletonScope()
iocContainer
  .bind<ReplyUseCase>(TYPES.ReplyUseCase)
  .to(ReplyUseCase)
  .inSingletonScope()
iocContainer
  .bind<GetActionsUseCase>(TYPES.GetActionsUseCase)
  .to(GetActionsUseCase)
  .inSingletonScope()
iocContainer
  .bind<InternalMessageFactory>(TYPES.InternalMessageFactory)
  .to(InternalMessageFactory)
  .inSingletonScope()
iocContainer
  .bind<InternalPublisher>(TYPES.InternalPublisher)
  .to(InternalPublisher)
  .inSingletonScope()
iocContainer
  .bind<ActionFactory>(TYPES.ActionFactory)
  .to(ActionFactory)
  .inSingletonScope()
iocContainer
  .bind<OutboundActionProcessor>(TYPES.OutboundActionProcessor)
  .to(OutboundActionProcessor)
  .inSingletonScope()
iocContainer
  .bind<RFPValidator>(TYPES.RFPValidator)
  .to(RFPValidator)
  .inSingletonScope()
iocContainer
  .bind<ReceiveInboundRequestUseCase>(TYPES.ReceiveInboundRequestUseCase)
  .to(ReceiveInboundRequestUseCase)
  .inSingletonScope()
iocContainer
  .bind<ReceiveInboundCorporateReplyUseCase>(TYPES.ReceiveInboundCorporateReplyUseCase)
  .to(ReceiveInboundCorporateReplyUseCase)
  .inSingletonScope()
iocContainer
  .bind<ReceiveInboundAcceptUseCase>(TYPES.ReceiveInboundAcceptUseCase)
  .to(ReceiveInboundAcceptUseCase)
  .inSingletonScope()
iocContainer
  .bind<ReceiveInboundDeclineUseCase>(TYPES.ReceiveInboundDeclineUseCase)
  .to(ReceiveInboundDeclineUseCase)
  .inSingletonScope()
iocContainer
  .bind<InboundUseCaseFactory>(TYPES.ReceiveInboundUseCaseFactory)
  .to(InboundUseCaseFactory)
  .inSingletonScope()
iocContainer
  .bind<CreateDeclineUseCase>(TYPES.CreateDeclineUseCase)
  .to(CreateDeclineUseCase)
  .inSingletonScope()
iocContainer
  .bind<AutoDeclineUseCase>(TYPES.AutoDeclineUseCase)
  .to(AutoDeclineUseCase)
  .inSingletonScope()

// Data layer
iocContainer
  .bind<OutboundMessageFactory>(TYPES.OutboundMessageFactory)
  .to(OutboundMessageFactory)
  .inSingletonScope()
iocContainer
  .bind<OutboundPublisher>(TYPES.OutboundPublisher)
  .to(OutboundPublisher)
  .inSingletonScope()
iocContainer
  .bind<CompanyRegistryClient>(TYPES.CompanyRegistryClient)
  .to(CompanyRegistryClient)
  .inSingletonScope()

// Service layer
iocContainer
  .bind<InboundProcessorService>(TYPES.InboundProcessorService)
  .to(InboundProcessorService)
  .inSingletonScope()

// Data layer
iocContainer
  .bind<ActionDataAgent>(TYPES.ActionDataAgent)
  .to(ActionDataAgent)
  .inSingletonScope()
iocContainer
  .bind<RequestForProposalDataAgent>(TYPES.RequestForProposalDataAgent)
  .to(RequestForProposalDataAgent)
  .inSingletonScope()

// External dependencies
const retryingAxios = createRetryingAxios()
iocContainer.bind<AxiosInstance>(TYPES.AxiosInstance).toConstantValue(retryingAxios)
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

const provideSingleton = (identifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>) => {
  return fluentProvider(identifier)
    .inSingletonScope()
    .done()
}

export { iocContainer, autoProvide, provide, provideSingleton, inject }
