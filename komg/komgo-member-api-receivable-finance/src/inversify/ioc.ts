import DataAccess from '@komgo/data-access'
import { Checker, CheckerInstance } from '@komgo/health-check'
import { MessagingFactory } from '@komgo/messaging-library'
import { getRequestIdHandler } from '@komgo/microservice-config'
import { NotificationManager, TaskManager } from '@komgo/notification-publisher'
import { AxiosInstance } from 'axios'
import { Container, decorate, inject, injectable, interfaces } from 'inversify'
import { autoProvide, makeFluentProvideDecorator, makeProvideDecorator } from 'inversify-binding-decorators'
import 'reflect-metadata'
import { Controller } from 'tsoa'

import * as DocumentUseCases from '../business-layer/documents/use-cases'
import * as Messaging from '../business-layer/messaging'
import * as MicroserviceClients from '../business-layer/microservice-clients'
import * as QuotesUseCases from '../business-layer/quotes/use-cases'
import { RDInfoAggregator } from '../business-layer/rd/RDInfoAggregator'
import * as RDUseCases from '../business-layer/rd/use-cases'
import { ReplyFactory } from '../business-layer/rfp/ReplyFactory'
import * as RFPUseCases from '../business-layer/rfp/use-cases'
import * as TradeCargoUseCases from '../business-layer/trade-cargo/use-cases'
import * as TradeSnapshotUseCases from '../business-layer/trade-snapshot/use-cases'
import * as Validators from '../business-layer/validation'
import * as DataAgents from '../data-layer/data-agents'
import * as Services from '../service-layer/services'
import { createRetryingAxios } from '../utils'

import { TYPES } from './types'
import { VALUES } from './values'

const iocContainer = new Container()
const provide = makeProvideDecorator(iocContainer)
const fluentProvider = makeFluentProvideDecorator(iocContainer)

decorate(injectable(), Controller)

// Values
iocContainer
  .bind<string>(VALUES.ApiRegistryBaseURL)
  .toConstantValue(process.env.API_REGISTRY_BASE_URL || 'http://api-registry:8080')
iocContainer
  .bind<string>(VALUES.ApiTradeCargoBaseURL)
  .toConstantValue(process.env.API_TRADE_CARGO_BASE_URL || 'http://api-trade-cargo:8080')
iocContainer.bind<string>(VALUES.ApiRFPBaseURL).toConstantValue(process.env.API_RFP_BASE_URL || 'http://api-rfp:8080')
iocContainer
  .bind<string>(VALUES.ApiNotifBaseURL)
  .toConstantValue(process.env.API_NOTIF_BASE_URL || 'http://api-notif:8080')
iocContainer
  .bind<number>(VALUES.ConsumeRetryDelay)
  .toConstantValue(parseInt(process.env.CONSUME_RETRY_DELAY, 10) || 300)
iocContainer
  .bind<string>(VALUES.RFPConsumerId)
  .toConstantValue(process.env.RFP_CONSUMER_ID || 'api-receivable-finance-rfp')
iocContainer.bind<string>(VALUES.RFPPublisherId).toConstantValue(process.env.RFP_PUBLISHER_ID || 'rfp')
iocContainer
  .bind<string>(VALUES.DocumentsPublisherId)
  .toConstantValue(process.env.DOCUMENTS_PUBLISHER_ID || 'documents')
iocContainer
  .bind<string>(VALUES.TradeCargoPublisherId)
  .toConstantValue(process.env.TRADE_CARGO_PUBLISHER_ID || 'trade-cargos')
iocContainer.bind<string>(VALUES.CompanyStaticId).toConstantValue(process.env.COMPANY_STATIC_ID)
iocContainer
  .bind<string>(VALUES.KapsuleUrl)
  .toConstantValue(process.env.ACCESS_CONTROL_ALLOW_ORIGIN || 'http://localhost:3010')
iocContainer.bind<number>(VALUES.PublishMaxRetries).toConstantValue(parseInt(process.env.PUBLISH_MAX_RETRIES, 10) || 3)
iocContainer.bind<number>(VALUES.PublishMaxDelay).toConstantValue(parseInt(process.env.PUBLISH_MAX_DELAY, 10) || 300)
iocContainer
  .bind<string>(VALUES.OutboundPublisherId)
  .toConstantValue(process.env.OUTBOUND_PUBLISHER_ID || 'to-event-mgnt')
iocContainer
  .bind<string>(VALUES.InboundPublisherId)
  .toConstantValue(process.env.INBOUND_PUBLISHER_ID || 'from-event-mgnt')

// Data layer
iocContainer
  .bind<DataAgents.ReceivablesDiscountingDataAgent>(TYPES.ReceivablesDiscountingDataAgent)
  .to(DataAgents.ReceivablesDiscountingDataAgent)
  .inSingletonScope()
iocContainer
  .bind<DataAgents.RFPDataAgent>(TYPES.RFPDataAgent)
  .to(DataAgents.RFPDataAgent)
  .inSingletonScope()
iocContainer
  .bind<DataAgents.TradeSnapshotDataAgent>(TYPES.TradeSnapshotDataAgent)
  .to(DataAgents.TradeSnapshotDataAgent)
  .inSingletonScope()
iocContainer
  .bind<DataAgents.QuoteDataAgent>(TYPES.QuoteDataAgent)
  .to(DataAgents.QuoteDataAgent)
  .inSingletonScope()
iocContainer
  .bind<DataAgents.ReplyDataAgent>(TYPES.ReplyDataAgent)
  .to(DataAgents.ReplyDataAgent)
  .inSingletonScope()

// Business layer
// -- RD
iocContainer
  .bind<RDUseCases.CreateRDUseCase>(TYPES.CreateRDUseCase)
  .to(RDUseCases.CreateRDUseCase)
  .inSingletonScope()
iocContainer
  .bind<RDUseCases.UpdateRDUseCase>(TYPES.UpdateRDUseCase)
  .to(RDUseCases.UpdateRDUseCase)
  .inSingletonScope()
iocContainer
  .bind<RDUseCases.ReplaceRDUseCase>(TYPES.ReplaceRDUseCase)
  .to(RDUseCases.ReplaceRDUseCase)
  .inSingletonScope()
iocContainer
  .bind<RDUseCases.GetFilteredRDInfosUseCase>(TYPES.GetFilteredRDInfosUseCase)
  .to(RDUseCases.GetFilteredRDInfosUseCase)
  .inSingletonScope()
iocContainer
  .bind<RDUseCases.GetRDInfoUseCase>(TYPES.GetRDInfoUseCase)
  .to(RDUseCases.GetRDInfoUseCase)
  .inSingletonScope()
iocContainer
  .bind<RDUseCases.ReceiveRDUpdateUseCase>(TYPES.ReceiveRDUpdateUseCase)
  .to(RDUseCases.ReceiveRDUpdateUseCase)
  .inSingletonScope()
iocContainer
  .bind<RDUseCases.GetRDHistoryUseCase>(TYPES.GetRDHistoryUseCase)
  .to(RDUseCases.GetRDHistoryUseCase)
  .inSingletonScope()
iocContainer
  .bind<RDUseCases.ShareRDUseCase>(TYPES.ShareRDUseCase)
  .to(RDUseCases.ShareRDUseCase)
  .inSingletonScope()
iocContainer
  .bind<RDUseCases.AddDiscountingUseCase>(TYPES.AddDiscountingUseCase)
  .to(RDUseCases.AddDiscountingUseCase)
  .inSingletonScope()
iocContainer
  .bind<RDUseCases.ReceiveAddDiscountingRequestUseCase>(TYPES.ReceiveAddDiscountingRequestUseCase)
  .to(RDUseCases.ReceiveAddDiscountingRequestUseCase)
  .inSingletonScope()

// -- Trade Snapshot
iocContainer
  .bind<TradeCargoUseCases.ReceiveTradeUseCase>(TYPES.ReceiveTradeUseCase)
  .to(TradeCargoUseCases.ReceiveTradeUseCase)
  .inSingletonScope()
iocContainer
  .bind<TradeCargoUseCases.ReceiveCargoUseCase>(TYPES.ReceiveCargoUseCase)
  .to(TradeCargoUseCases.ReceiveCargoUseCase)
  .inSingletonScope()
iocContainer
  .bind<TradeSnapshotUseCases.ShareTradeSnapshotUseCase>(TYPES.ShareTradeSnapshotUseCase)
  .to(TradeSnapshotUseCases.ShareTradeSnapshotUseCase)
  .inSingletonScope()
iocContainer
  .bind<TradeSnapshotUseCases.ReceiveTradeSnapshotUpdateUseCase>(TYPES.ReceiveTradeSnapshotUpdateUseCase)
  .to(TradeSnapshotUseCases.ReceiveTradeSnapshotUpdateUseCase)
  .inSingletonScope()
iocContainer
  .bind<TradeSnapshotUseCases.GetTradeHistoryUseCase>(TYPES.GetTradeHistoryUseCase)
  .to(TradeSnapshotUseCases.GetTradeHistoryUseCase)
  .inSingletonScope()

// -- RFP
iocContainer
  .bind<RFPUseCases.CreateRFPRequestUseCase>(TYPES.CreateRFPRequestUseCase)
  .to(RFPUseCases.CreateRFPRequestUseCase)
  .inSingletonScope()
iocContainer
  .bind<RFPUseCases.ReceiveRequestMessageUseCase>(TYPES.ReceiveRequestMessageUseCase)
  .to(RFPUseCases.ReceiveRequestMessageUseCase)
  .inSingletonScope()
iocContainer
  .bind<RFPUseCases.RejectRFPUseCase>(TYPES.RejectRFPUseCase)
  .to(RFPUseCases.RejectRFPUseCase)
  .inSingletonScope()

iocContainer
  .bind<RFPUseCases.ReceiveResponseMessageUseCase>(TYPES.ReceiveResponseMessageUseCase)
  .to(RFPUseCases.ReceiveResponseMessageUseCase)
  .inSingletonScope()
iocContainer
  .bind<RFPUseCases.ReceiveDeclineMessageUseCase>(TYPES.ReceiveDeclineMessageUseCase)
  .to(RFPUseCases.ReceiveDeclineMessageUseCase)
  .inSingletonScope()
iocContainer
  .bind<RFPUseCases.ReceiveAcceptMessageUseCase>(TYPES.ReceiveAcceptMessageUseCase)
  .to(RFPUseCases.ReceiveAcceptMessageUseCase)
  .inSingletonScope()
iocContainer
  .bind<RFPUseCases.GetRFPSummaryUseCase>(TYPES.GetRFPSummaryUseCase)
  .to(RFPUseCases.GetRFPSummaryUseCase)
  .inSingletonScope()
iocContainer
  .bind<RFPUseCases.AcceptQuoteUseCase>(TYPES.AcceptQuoteUseCase)
  .to(RFPUseCases.AcceptQuoteUseCase)
  .inSingletonScope()
iocContainer
  .bind<RFPUseCases.GetParticipantRFPSummaryUseCase>(TYPES.GetParticipantRFPSummaryUseCase)
  .to(RFPUseCases.GetParticipantRFPSummaryUseCase)
  .inSingletonScope()
iocContainer
  .bind<RFPUseCases.SubmitQuoteUseCase>(TYPES.SubmitQuoteUseCase)
  .to(RFPUseCases.SubmitQuoteUseCase)
  .inSingletonScope()
iocContainer
  .bind<ReplyFactory>(TYPES.ReplyFactory)
  .to(ReplyFactory)
  .inSingletonScope()

// -- Quotes
iocContainer
  .bind<QuotesUseCases.CreateQuoteUseCase>(TYPES.CreateQuoteUseCase)
  .to(QuotesUseCases.CreateQuoteUseCase)
  .inSingletonScope()
iocContainer
  .bind<QuotesUseCases.GetQuoteUseCase>(TYPES.GetQuoteUseCase)
  .to(QuotesUseCases.GetQuoteUseCase)
  .inSingletonScope()
iocContainer
  .bind<QuotesUseCases.UpdateQuoteUseCase>(TYPES.UpdateQuoteUseCase)
  .to(QuotesUseCases.UpdateQuoteUseCase)
  .inSingletonScope()
iocContainer
  .bind<QuotesUseCases.ShareQuoteUseCase>(TYPES.ShareQuoteUseCase)
  .to(QuotesUseCases.ShareQuoteUseCase)
  .inSingletonScope()
iocContainer
  .bind<QuotesUseCases.ReceiveFinalAgreedTermsUpdateUseCase>(TYPES.ReceiveFinalAgreedTermsUpdateUseCase)
  .to(QuotesUseCases.ReceiveFinalAgreedTermsUpdateUseCase)
  .inSingletonScope()
iocContainer
  .bind<QuotesUseCases.GetQuoteHistoryUseCase>(TYPES.GetQuoteHistoryUseCase)
  .to(QuotesUseCases.GetQuoteHistoryUseCase)
  .inSingletonScope()

// -- Documents
iocContainer
  .bind<DocumentUseCases.DocumentReceivedUseCase>(TYPES.DocumentReceivedUseCase)
  .to(DocumentUseCases.DocumentReceivedUseCase)
  .inSingletonScope()

// -- Validators
iocContainer
  .bind<Validators.ReceivablesDiscountingValidator>(TYPES.ReceivablesDiscountingValidator)
  .to(Validators.ReceivablesDiscountingValidator)
  .inSingletonScope()
iocContainer
  .bind<Validators.RFPValidator>(TYPES.RFPValidator)
  .to(Validators.RFPValidator)
  .inSingletonScope()
iocContainer
  .bind<Validators.QuoteValidator>(TYPES.QuoteValidator)
  .to(Validators.QuoteValidator)
  .inSingletonScope()
iocContainer
  .bind<Validators.TradeSnapshotValidator>(TYPES.TradeSnapshotValidator)
  .to(Validators.TradeSnapshotValidator)
  .inSingletonScope()
iocContainer
  .bind<Validators.AcceptedRDValidator>(TYPES.AcceptedRDValidator)
  .to(Validators.AcceptedRDValidator)
  .inSingletonScope()
iocContainer
  .bind<Validators.AddDiscountingValidator>(TYPES.AddDiscountingValidator)
  .to(Validators.AddDiscountingValidator)
  .inSingletonScope()

// -- Microservice clients
iocContainer
  .bind<MicroserviceClients.CompanyRegistryClient>(TYPES.CompanyRegistryClient)
  .to(MicroserviceClients.CompanyRegistryClient)
  .inSingletonScope()
iocContainer
  .bind<MicroserviceClients.TradeCargoClient>(TYPES.TradeCargoClient)
  .to(MicroserviceClients.TradeCargoClient)
  .inSingletonScope()
iocContainer
  .bind<MicroserviceClients.RFPClient>(TYPES.RFPClient)
  .to(MicroserviceClients.RFPClient)
  .inSingletonScope()
iocContainer
  .bind<MicroserviceClients.NotificationClient>(TYPES.NotificationClient)
  .to(MicroserviceClients.NotificationClient)
  .inSingletonScope()
iocContainer
  .bind<MicroserviceClients.TaskClient>(TYPES.TaskClient)
  .to(MicroserviceClients.TaskClient)
  .inSingletonScope()

// -- Messaging
iocContainer
  .bind<Messaging.ReceiveAddDiscountingMessageUseCaseFactory>(TYPES.ReceiveAddDiscountingMessageUseCaseFactory)
  .to(Messaging.ReceiveAddDiscountingMessageUseCaseFactory)
  .inSingletonScope()
iocContainer
  .bind<Messaging.ReceiveMessageUseCaseFactory>(TYPES.ReceiveMessageUseCaseFactory)
  .to(Messaging.ReceiveMessageUseCaseFactory)
  .inSingletonScope()
iocContainer
  .bind<Messaging.ReceiveUpdateMessageFactory>(TYPES.ReceiveUpdateMessageFactory)
  .to(Messaging.ReceiveUpdateMessageFactory)
  .inSingletonScope()
iocContainer
  .bind<RDInfoAggregator>(TYPES.RDInfoAggregator)
  .to(RDInfoAggregator)
  .inSingletonScope()
iocContainer
  .bind<Messaging.OutboundMessageFactory>(TYPES.OutboundMessageFactory)
  .to(Messaging.OutboundMessageFactory)
  .inSingletonScope()
iocContainer
  .bind<Messaging.OutboundPublisher>(TYPES.OutboundPublisher)
  .to(Messaging.OutboundPublisher)
  .inSingletonScope()

// Service layer
iocContainer
  .bind<Services.MessageProcessorService>(TYPES.MessageProcessorService)
  .to(Services.MessageProcessorService)
  .inSingletonScope()
iocContainer
  .bind<Services.UpdateMessageProcessor>(TYPES.UpdateMessageProcessor)
  .to(Services.UpdateMessageProcessor)
  .inSingletonScope()
iocContainer
  .bind<Services.RFPMessageProcessor>(TYPES.RFPMessageProcessor)
  .to(Services.RFPMessageProcessor)
  .inSingletonScope()
iocContainer
  .bind<Services.TradeCargoMessageProcessor>(TYPES.TradeCargoMessageProcessor)
  .to(Services.TradeCargoMessageProcessor)
  .inSingletonScope()
iocContainer
  .bind<Services.DocumentMessageProcessor>(TYPES.DocumentMessageProcessor)
  .to(Services.DocumentMessageProcessor)
  .inSingletonScope()
iocContainer
  .bind<Services.AddDiscountingMessageProcessor>(TYPES.AddDiscountingMessageProcessor)
  .to(Services.AddDiscountingMessageProcessor)
  .inSingletonScope()

// External dependencies
const retryingAxios = createRetryingAxios()
iocContainer.bind<AxiosInstance>(TYPES.AxiosInstance).toConstantValue(retryingAxios)
iocContainer.bind<Checker>(TYPES.HealthChecker).toConstantValue(CheckerInstance)
iocContainer.bind<any>(TYPES.DataAccess).toConstantValue(DataAccess)
iocContainer
  .bind<NotificationManager>(TYPES.NotificationManager)
  .toConstantValue(new NotificationManager(process.env.API_NOTIF_BASE_URL || 'http://api-notif:8080'))
iocContainer
  .bind<TaskManager>(TYPES.TaskManager)
  .toConstantValue(new TaskManager(process.env.API_NOTIF_BASE_URL || 'http://api-notif:8080'))
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
