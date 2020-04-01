import { IWeb3Instance, Web3Instance } from '@komgo/blockchain-access'
import { MessagingFactory } from '@komgo/messaging-library'
import { NotificationManager, TaskManager } from '@komgo/notification-publisher'
import { getRequestIdHandler } from '@komgo/microservice-config'
import { Container, decorate, inject, injectable, interfaces } from 'inversify'
import { autoProvide, makeFluentProvideDecorator, makeProvideDecorator } from 'inversify-binding-decorators'
import { Controller } from 'tsoa'

import { ILCContract } from '../business-layer/blockchain/ILCContract'
import { ILCTransactionManager } from '../business-layer/blockchain/ILCTransactionManager'
import { ISignerClient } from '../business-layer/common/ISignerClient'
import { LCContract } from '../business-layer/blockchain/LCContract'
import { LCTransactionManager } from '../business-layer/blockchain/LCTransactionManager'
import SignerClient from '../business-layer/common/SignerClient'
import { DocumentEventProcessor } from '../business-layer/documents/DocumentEventProcessor'
import { DocumentRequestBuilder, IDocumentRequestBuilder } from '../business-layer/documents/DocumentRequestBuilder'
import { DocumentService } from '../business-layer/documents/DocumentService'
import { DocumentServiceClient, IDocumentServiceClient } from '../business-layer/documents/DocumentServiceClient'
import { IDocumentProcessor } from '../business-layer/documents/IDocumentProcessor'
import IDocumentService from '../business-layer/documents/IDocumentService'
import { LCEventsProcessor } from '../business-layer/events/LC/LCEventsProcessor'
import { ILCEventService } from '../business-layer/events/LC/ILCEventService'
import { IEventsProcessor } from '../business-layer/common/IEventsProcessor'
import IService from '../business-layer/IService'
import { LCCreatedService } from '../business-layer/events/LC/LCCreatedService'
import { LCDataUpdatedEvent } from '../business-layer/events/LC/LCDataUpdatedEvent'
import { BlockchainEventsProcessor } from '../business-layer/common/BlockchainEventsProcessor'
import { ILCTransitionEventProcessor } from '../business-layer/events/LC/LCTransitionEvents/ILCTransitionEventProcessor'
import { LCAcknowledgedProcessor } from '../business-layer/events/LC/LCTransitionEvents/LCAcknowledgedProcessor'
import { LCAdvisedProcessor } from '../business-layer/events/LC/LCTransitionEvents/LCAdvisedProcessor'
import { ILCDocumentManager, LCDocumentManager } from '../business-layer/events/LC/LCTransitionEvents/LCDocumentManager'
import { LCIssuedProcessor } from '../business-layer/events/LC/LCTransitionEvents/LCIssuedProcessor'
import { LCRequestedProcessor } from '../business-layer/events/LC/LCTransitionEvents/LCRequestedProcessor'
import { LCRequestRejectedProcessor } from '../business-layer/events/LC/LCTransitionEvents/LCRequestRejectedProcessor'
import { LCTransitionProcessor } from '../business-layer/events/LC/LCTransitionEvents/LCTransitionProcessor'
import { ILCUseCase } from '../business-layer/ILCUseCase'
import { LCAcknowledgeUseCase } from '../business-layer/LCAcknowledgeUseCase'
import { LCAdviseUseCase } from '../business-layer/LCAdviseUseCase'
import { LCIssueUseCase } from '../business-layer/LCIssueUseCase'
import { LCRejectAdvisingUseCase } from '../business-layer/LCRejectAdvisingUseCase'
import { LCRejectBeneficiaryUseCase } from '../business-layer/LCRejectBeneficiaryUseCase'
import { LCRequestRejectUseCase } from '../business-layer/LCRequestRejectUseCase'
import { LCUseCase } from '../business-layer/LCUseCase'
import { IMessageEventProcessor } from '../business-layer/message-processing/IMessageEventProcessor'
import { MessageProcessor } from '../business-layer/message-processing/MessageProcessor'
import { IVaktMessageNotifier, VaktMessageNotifier } from '../business-layer/messaging/VaktMessageNotifier'
import {
  IVaktMessagingFactoryManager,
  VaktMessagingFactoryManager
} from '../business-layer/messaging/VaktMessagingFactoryManager'
import { IVaktMessagingManager, VaktMessagingManager } from '../business-layer/messaging/VaktMessagingManager'
import { ILCTaskFactory, LCTaskFactory } from '../business-layer/tasks/LCTaskFactory'
import { ILCTaskProcessor, LCTaskProcessor } from '../business-layer/tasks/LCTaskProcessor'
import { ITradeCargoClient } from '../business-layer/trade-cargo/ITradeCargoClient'
import { TradeCargoClient } from '../business-layer/trade-cargo/TradeCargoClient'
import { DiscardTradeDocumentProcessor } from '../business-layer/trade-documents/DiscardTradeDocumentProcessor'
import { TradeDocumentProcessor } from '../business-layer/trade-documents/TradeDocumentProcessor'
import {
  ILCCacheDataAgent,
  ILCAmendmentDataAgent,
  LCAmendmentDataAgent,
  LCCacheDataAgent
} from '../data-layer/data-agents'
import CompanyRegistryService from '../service-layer/CompanyRegistryService'
import { ICompanyRegistryService } from '../service-layer/ICompanyRegistryService'
import IPollingServiceFactory from '../service-layer/IPollingServiceFactory'
import PollingServiceFactory from '../service-layer/PollingServiceFactory'
import Uploader from '../service-layer/utils/Uploader'
import { TYPES } from './types'
import { LCRejectIssuedProcessor } from '../business-layer/events/LC/LCTransitionEvents/LCRejectIssuedProcessor'

import { NonceIncrementedService } from '../business-layer/events/LC/NonceIncrementedService'

import { ILCAmendmentUseCase } from '../business-layer/ILCAmendmentUseCase'
import { LCAmendmentUseCase } from '../business-layer/LCAmendmentUseCase'
import { ILCAmendmentTransactionManager } from '../business-layer/blockchain/ILCAmendmentTransactionManager'
import { LCAmendmentTransactionManager } from '../business-layer/blockchain/LCAmendmentTransactionManager'
import { LCAmendmentContract } from '../business-layer/blockchain/LCAmendmentContract'
import { TradeEventProcessor } from '../business-layer/trade-cargo/TradeEventProcessor'
import { LCAmendmentCreatedService } from '../business-layer/events/LCAmendments/LCAmendmentCreatedService'
import { ILCAmendmentEventService } from '../business-layer/events/LCAmendments/ILCAmendmentEventService'
import { LCAmendmentEventsProcessor } from '../business-layer/events/LCAmendments/LCAmendmentEventsProcessor'

import { ILCTimerService, LCTimerService } from '../business-layer/timers/LCTimerService'
import { TimerService, ITimerService } from '../business-layer/timers/TimerService'

import { ITimerServiceClient } from '../business-layer/timers/ITimerServiceClient'
import { TimerServiceClient } from '../business-layer/timers/TimerServiceClient'
import { ITimerRequestBuilder, TimerRequestBuilder } from '../business-layer/timers/TimerRequestBuilder'
import { CONFIG } from './config'
import { LCAmendmentTransitionService } from '../business-layer/events/LCAmendments/LCAmendmentTransitionService'
import { LCAmendmentApprovedByIssuingBankEventService } from '../business-layer/events/LCAmendments/LCAmendmentApprovedByIssuingBankEventService'
import { LCAmendmentRejectedByIssuingBankEventService } from '../business-layer/events/LCAmendments/LCAmendmentRejectedByIssuingBankEventService'
import { LCAmendmentDataUpdatedEventService } from '../business-layer/events/LCAmendments/LCAmendmentDataUpdatedEventService'
import { LCAmendmentRejectionDataUpdatedEventService } from '../business-layer/events/LCAmendments/LCAmendmentRejectionDataUpdatedEventService'
import { registerPresentationComponents } from './ioc.presentation'
import { registerSBLCComponents } from './ioc.sblc'
import { registerCounterComponents } from './ioc.counter'
import { ITradeInstrumentValidationService } from '../business-layer/trade-cargo/ITradeInstrumentValidationService'
import { TradeInstrumentValidationService } from '../business-layer/trade-cargo/TradeInstrumentValidationService'
import { registerLetterOfCreditComponents } from './ioc.letterofcredit'
import { MessagePublishingService } from '../business-layer/message-processing/MessagePublishingService'
import {
  ILetterOfCreditTimerService,
  LetterOfCreditTimerService
} from '../business-layer/timers/LetterOfCreditTimerService'

const iocContainer = new Container()
const provide = makeProvideDecorator(iocContainer)
const fluentProvider = makeFluentProvideDecorator(iocContainer)

decorate(injectable(), Controller)

const API_NOTIF_BASE_URL = process.env.API_NOTIF_BASE_URL || 'http://api-notif:8080'

registerSBLCComponents(iocContainer)
registerCounterComponents(iocContainer)
registerLetterOfCreditComponents(iocContainer)

iocContainer.bind<MessagePublishingService>(TYPES.MessagePublisher).to(MessagePublishingService)
iocContainer
  .bind<string>(CONFIG.KapsuleUrl)
  .toConstantValue(process.env.ACCESS_CONTROL_ALLOW_ORIGIN || 'http://localhost:3010')
iocContainer
  .bind<string>(CONFIG.SignerUrl)
  .toConstantValue(process.env.API_BLOCKCHAIN_SIGNER_BASE_URL || 'http://api-blockchain-signer:8080')
iocContainer
  .bind<string>(CONFIG.RegistryUrl)
  .toConstantValue(process.env.API_REGISTRY_BASE_URL || 'http://api-registry:8080')
iocContainer
  .bind<string>(CONFIG.TradeCargoUrl)
  .toConstantValue(process.env.API_TRADE_CARGO_BASE_URL || 'http://api-trade-cargo:8080')
iocContainer.bind<string>('notifUrl').toConstantValue(API_NOTIF_BASE_URL)
iocContainer
  .bind<string>(CONFIG.DocumentsServiceUrl)
  .toConstantValue(process.env.API_DOCUMENTS_BASE_URL || 'http://api-documents:8080')
iocContainer.bind<string>('timerServiceUrl').toConstantValue(process.env.API_TIMER_BASE_URL || 'http://api-timers:8080')

iocContainer.bind<string>(CONFIG.CompanyStaticId).toConstantValue(process.env.COMPANY_STATIC_ID)
iocContainer
  .bind(TYPES.MessagingFactory)
  .toConstantValue(
    new MessagingFactory(
      process.env.INTERNAL_MQ_HOST,
      process.env.INTERNAL_MQ_USERNAME,
      process.env.INTERNAL_MQ_PASSWORD,
      getRequestIdHandler()
    )
  )
iocContainer.bind<ILCEventService>(TYPES.NonceIncrementedService).to(NonceIncrementedService)
iocContainer.bind<ILCContract>(TYPES.LCContract).to(LCContract)
iocContainer.bind<IPollingServiceFactory>(TYPES.PollingServiceFactory).to(PollingServiceFactory)
iocContainer.bind<IEventsProcessor>(TYPES.EventsProcessor).to(LCEventsProcessor)
iocContainer.bind<IEventsProcessor>(TYPES.EventsProcessor).to(LCAmendmentEventsProcessor)
iocContainer.bind<Uploader>(TYPES.Uploader).to(Uploader)

// LC state transition processors
iocContainer.bind<ILCEventService>(TYPES.LCStateTransitionService).to(LCTransitionProcessor)
iocContainer.bind<ILCTransitionEventProcessor>(TYPES.LCStateTransitionProcessor).to(LCRequestedProcessor)
iocContainer.bind<ILCTransitionEventProcessor>(TYPES.LCStateTransitionProcessor).to(LCRequestRejectedProcessor)
iocContainer.bind<ILCTransitionEventProcessor>(TYPES.LCStateTransitionProcessor).to(LCIssuedProcessor)
iocContainer.bind<ILCTransitionEventProcessor>(TYPES.LCStateTransitionProcessor).to(LCRejectIssuedProcessor)
iocContainer.bind<ILCTransitionEventProcessor>(TYPES.LCStateTransitionProcessor).to(LCAdvisedProcessor)
iocContainer.bind<ILCTransitionEventProcessor>(TYPES.LCStateTransitionProcessor).to(LCAcknowledgedProcessor)
iocContainer.bind<LCRequestedProcessor>(TYPES.LCRequestedProcessor).to(LCRequestedProcessor)

iocContainer.bind<ILCTaskFactory>(TYPES.LCTaskFactory).to(LCTaskFactory)
iocContainer.bind<ILCTaskProcessor>(TYPES.LCTaskProcessor).to(LCTaskProcessor)
iocContainer.bind<IWeb3Instance>(TYPES.Web3Instance).to(Web3Instance)

iocContainer.bind<TaskManager>(TYPES.TaskManagerClient).toConstantValue(new TaskManager(API_NOTIF_BASE_URL))
iocContainer
  .bind<NotificationManager>(TYPES.NotificationManagerClient)
  .toConstantValue(new NotificationManager(API_NOTIF_BASE_URL))

iocContainer.bind<ILCCacheDataAgent>(TYPES.LCCacheDataAgent).to(LCCacheDataAgent)

iocContainer.bind<ISignerClient>(TYPES.SignerClient).to(SignerClient)
iocContainer.bind<ILCTransactionManager>(TYPES.LCTransactionManager).to(LCTransactionManager)
iocContainer.bind<ILCEventService>(TYPES.LCCreatedService).to(LCCreatedService)
iocContainer.bind<ILCEventService>(TYPES.LCDataUpdateEventService).to(LCDataUpdatedEvent)

iocContainer.bind<ILCAmendmentUseCase>(TYPES.LCAmendmentUseCase).to(LCAmendmentUseCase)
iocContainer.bind<ILCAmendmentDataAgent>(TYPES.LCAmendmentDataAgent).to(LCAmendmentDataAgent)
iocContainer.bind<ILCAmendmentTransactionManager>(TYPES.LCAmendmentTransactionManager).to(LCAmendmentTransactionManager)
iocContainer.bind<LCAmendmentContract>(TYPES.LCAmendmentContract).to(LCAmendmentContract)

iocContainer.bind<ILCUseCase>(TYPES.LCUseCase).to(LCUseCase)
iocContainer.bind<LCIssueUseCase>(TYPES.LCIssueUseCase).to(LCIssueUseCase)
iocContainer.bind<LCRequestRejectUseCase>(TYPES.LCRequestRejectUseCase).to(LCRequestRejectUseCase)
iocContainer.bind<LCRejectAdvisingUseCase>(TYPES.LCRejectAdvisingUseCase).to(LCRejectAdvisingUseCase)
iocContainer.bind<LCAcknowledgeUseCase>(TYPES.LCAcknowledgeUseCase).to(LCAcknowledgeUseCase)
iocContainer.bind<LCRejectBeneficiaryUseCase>(TYPES.LCRejectBeneficiaryUseCase).to(LCRejectBeneficiaryUseCase)
iocContainer.bind<LCAdviseUseCase>(TYPES.LCAdviseUseCase).to(LCAdviseUseCase)

iocContainer.bind<IVaktMessagingManager>(TYPES.VaktMessagingManager).to(VaktMessagingManager)
iocContainer.bind<IVaktMessagingFactoryManager>(TYPES.VaktMessagingFactoryManager).to(VaktMessagingFactoryManager)
iocContainer.bind<IVaktMessageNotifier>(TYPES.VaktMessageNotifier).to(VaktMessageNotifier)

iocContainer.bind<ICompanyRegistryService>(TYPES.CompanyRegistryService).to(CompanyRegistryService)

iocContainer.bind<IDocumentServiceClient>(TYPES.DocumentServiceClient).to(DocumentServiceClient)
iocContainer.bind<IDocumentRequestBuilder>(TYPES.DocumentRequestBuilder).to(DocumentRequestBuilder)
iocContainer.bind<ILCDocumentManager>(TYPES.LCDocumentManager).to(LCDocumentManager)

iocContainer.bind<IMessageEventProcessor>(TYPES.MessageEventProcessor).to(DocumentEventProcessor)
iocContainer.bind<IMessageEventProcessor>(TYPES.MessageEventProcessor).to(BlockchainEventsProcessor)
iocContainer.bind<IMessageEventProcessor>(TYPES.MessageEventProcessor).to(TradeEventProcessor)
iocContainer.bind<IDocumentProcessor>(TYPES.TradeDocumentProcessor).to(TradeDocumentProcessor)
iocContainer.bind<IDocumentProcessor>(TYPES.DiscardTradeDocumentProcessor).to(DiscardTradeDocumentProcessor)

iocContainer.bind<ILCAmendmentEventService>(TYPES.LCAmendmentCreatedService).to(LCAmendmentCreatedService)
iocContainer
  .bind<ILCAmendmentEventService>(TYPES.LCAmendmentRejectionDataUpdatedEventService)
  .to(LCAmendmentRejectionDataUpdatedEventService)
iocContainer.bind<ILCAmendmentEventService>(TYPES.LCAmendmentTransitionService).to(LCAmendmentTransitionService)
iocContainer
  .bind<ILCAmendmentEventService>(TYPES.LCAmendmentApprovedByIssuingBankEventService)
  .to(LCAmendmentApprovedByIssuingBankEventService)
iocContainer
  .bind<ILCAmendmentEventService>(TYPES.LCAmendmentRejectedByIssuingBankEventService)
  .to(LCAmendmentRejectedByIssuingBankEventService)
iocContainer
  .bind<ILCAmendmentEventService>(TYPES.LCAmendmentDataUpdatedEventService)
  .to(LCAmendmentDataUpdatedEventService)

registerPresentationComponents(iocContainer)

iocContainer
  .bind<IService>(TYPES.MessageProcessor)
  .to(MessageProcessor)
  .inSingletonScope()
iocContainer.bind<ILCTimerService>(TYPES.LCTimerService).to(LCTimerService)
iocContainer.bind<ITimerService>(TYPES.TimerService).to(TimerService)
iocContainer.bind<ILetterOfCreditTimerService>(TYPES.LetterOfCreditTimerService).to(LetterOfCreditTimerService)

iocContainer.bind<ITimerServiceClient>(TYPES.TimerServiceClient).to(TimerServiceClient)
iocContainer.bind<ITimerRequestBuilder>(TYPES.TimerRequestBuilder).to(TimerRequestBuilder)

iocContainer.bind<ITradeCargoClient>(TYPES.TradeCargoClient).to(TradeCargoClient)

iocContainer.bind<IDocumentService>(TYPES.DocumentService).to(DocumentService)

iocContainer
  .bind<ITradeInstrumentValidationService>(TYPES.TradeInstrumentValidationService)
  .to(TradeInstrumentValidationService)

iocContainer.bind<string>(CONFIG.RegistryContractAddress).toConstantValue(process.env.ENS_REGISTRY_CONTRACT_ADDRESS)

iocContainer
  .bind<number>(CONFIG.InternalMqPollingIntervalMs)
  .toConstantValue(parseInt(process.env.INTERNAL_MQ_POLLING_INTERVAL_MS, 10) || 300)
iocContainer
  .bind<string>(CONFIG.ConsumerId)
  .toConstantValue(process.env.INTERNAL_MQ_CONSUMER_ID || 'api-trade-finance-consumer')
iocContainer
  .bind<string>(CONFIG.FromPublisherId)
  .toConstantValue(process.env.INTERNAL_MQ_FROM_PUBLISHER_ID || 'from-event-mgnt')
iocContainer
  .bind<string>(CONFIG.TradeCargosPublisherId)
  .toConstantValue(process.env.TRADE_CARGOS_PUBLISHER_ID || 'trade-cargos')
iocContainer.bind<string>('publisher-id').toConstantValue(process.env.INTERNAL_MQ_TO_PUBLISHER_ID || 'to-event-mgnt')

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
