import { SignerApi } from '@komgo/api-blockchain-signer-client'
import { Web3Wrapper } from '@komgo/blockchain-access'
import DataAccess from '@komgo/data-access'
import { DocumentGenerator, IDocumentGenerator } from '@komgo/document-generator'
import { getLogger } from '@komgo/logging'
import { MessagingFactory } from '@komgo/messaging-library'
import { getRequestIdHandler } from '@komgo/microservice-config'
import { NotificationManager, TaskManager } from '@komgo/notification-publisher'
import { Container, decorate, inject, injectable, interfaces } from 'inversify'
import { autoProvide, makeFluentProvideDecorator, makeProvideDecorator } from 'inversify-binding-decorators'
import mongoose from 'mongoose'
import 'reflect-metadata'
import { Controller } from 'tsoa'

import { ConsumerWatchdogFactory } from '../business-layer/messaging/ConsumerWatchdogFactory'
import { EVENT_NAME } from '../business-layer/messaging/enums'
import { DocumentFeedbackProcessor } from '../business-layer/messaging/event-processors/DocumentFeedbackProcessor'
import { DocumentProcessorUtils } from '../business-layer/messaging/event-processors/DocumentProcessorUtils'
import { DocumentRequestDismissTypeProcessor } from '../business-layer/messaging/event-processors/DocumentRequestDismissTypeProcessor'
import { DocumentRequestNoteProcessor } from '../business-layer/messaging/event-processors/DocumentRequestNoteProcessor'
import { DocumentRequestProcessor } from '../business-layer/messaging/event-processors/DocumentRequestProcessor'
import { SendDocumentProcessor } from '../business-layer/messaging/event-processors/SendDocumentProcessor'
import { TransactionResultProcessor } from '../business-layer/messaging/event-processors/TransactionResultProcessor'
import { EventsRouter } from '../business-layer/messaging/EventsRouter'
import { RabbitMQConsumingClient } from '../business-layer/messaging/RabbitMQConsumingClient'
import { RabbitMQPublishingClient } from '../business-layer/messaging/RabbitMQPublishingClient'
import { RequestClient } from '../business-layer/messaging/RequestClient'
import { NotificationClient } from '../business-layer/notifications/NotificationClient'
import { DocumentTemplateCompiler } from '../business-layer/presentation/DocumentTemplateCompiler'
import { IncomingRequestService } from '../business-layer/services/IncomingRequestService'
import { ReceivedDocumentsService } from '../business-layer/services/ReceivedDocumentsService'
import { RequestService } from '../business-layer/services/RequestService'
import { SendDocumentsService } from '../business-layer/services/SendDocumentsService'
import ServiceUtils from '../business-layer/services/ServiceUtils'
import { TaskClient } from '../business-layer/tasks/TaskClient'
import CategoryDataAgent from '../data-layer/data-agents/CategoryDataAgent'
import DocumentDataAgent from '../data-layer/data-agents/DocumentDataAgent'
import DocumentTemplateDataAgent from '../data-layer/data-agents/DocumentTemplateDataAgent'
import GridFsWrapper from '../data-layer/data-agents/GridFsWrapper'
import IncomingRequestDataAgent from '../data-layer/data-agents/IncomingRequestDataAgent'
import OutgoingRequestDataAgent from '../data-layer/data-agents/OutgoingRequestDataAgent'
import ProductDataAgent from '../data-layer/data-agents/ProductDataAgent'
import ReceivedDocumentsDataAgent from '../data-layer/data-agents/ReceivedDocumentsDataAgent'
import SharedDocumentsDataAgent from '../data-layer/data-agents/SharedDocumentsDataAgent'
import TemplateDataAgent from '../data-layer/data-agents/TemplateDataAgent'
import TypeDataAgent from '../data-layer/data-agents/TypeDataAgent'
import MagicLinkService from '../infrastructure/api-magic-link/MagicLinkService'
import { CompaniesRegistryClient } from '../infrastructure/api-registry/CompaniesRegistryClient'
import { UsersRegistryClient } from '../infrastructure/api-users/UsersRegistryClient'
import * as blockchain from '../infrastructure/blockchain'
import ControllerUtils from '../service-layer/controllers/utils'
import DecoratorService from '../service-layer/events/DecoratorService'
import DocumentEventService from '../service-layer/events/DocumentEventService'
import IService from '../service-layer/events/IService'
import Uploader from '../service-layer/utils/Uploader'
import Clock from '../utils/Clock'

import { CONFIG_KEYS } from './config_keys'
import { TYPES } from './types'

const logger = getLogger('ioc')

const iocContainer = new Container()
const provide = makeProvideDecorator(iocContainer)
const fluentProvider = makeFluentProvideDecorator(iocContainer)

decorate(injectable(), Controller)
decorate(injectable(), DocumentGenerator)

const web3Wrapper = new Web3Wrapper()
iocContainer.bind(TYPES.Web3Instance).toConstantValue(web3Wrapper.web3Instance)

iocContainer.bind(TYPES.DocumentsTransactionManagerProvider).toProvider(context => {
  return async () => {
    logger.info('Creating a transaction manager')
    const signerApi = context.container.get<SignerApi>(TYPES.SignerClient)

    logger.info('Building a transaction manager instance')
    return blockchain.buildDocTxManager(web3Wrapper.web3Instance, signerApi)
  }
})

iocContainer.bind<GridFsWrapper>(TYPES.GridFsWrapper).to(GridFsWrapper)

iocContainer.bind(TYPES.GridFsProvider).toProvider(context => {
  return async () => {
    logger.info('Creating GridFS instance')
    const connection = await getMongooseConnection()

    const gridFs = require('mongoose-gridfs')({
      collection: 'documents',
      model: 'DocumentFile',
      mongooseConnection: connection
    })

    logger.info('GridFS instance created')
    return gridFs
  }
})

async function getMongooseConnection(): Promise<mongoose.Connection> {
  if (DataAccess.connection) {
    logger.info('Already connected to Mongo. Returning existing Mongoose connection')
    return DataAccess.connection
  }

  logger.info('Not connected to Mongo. Subscribing to Mongoose connected notification')
  return new Promise((resolve, reject) => {
    DataAccess.connection.on('connected', () => {
      logger.info('Mongoose on connected event was received')
      resolve(DataAccess.connection)
    })
  })
}

iocContainer.bind<string>(CONFIG_KEYS.HTTPProxy).toConstantValue(process.env.HTTP_PROXY)
iocContainer.bind<string>(CONFIG_KEYS.HTTPSProxy).toConstantValue(process.env.HTTPS_PROXY)

iocContainer.bind<IDocumentGenerator>(TYPES.DocumentGenerator).to(DocumentGenerator)
iocContainer.bind<DocumentTemplateCompiler>(TYPES.DocumentTemplateCompiler).to(DocumentTemplateCompiler)

iocContainer.bind<ControllerUtils>(TYPES.ControllerUtils).to(ControllerUtils)

// Data agents
iocContainer.bind<DocumentDataAgent>(TYPES.DocumentDataAgent).to(DocumentDataAgent)
iocContainer.bind<DocumentTemplateDataAgent>(TYPES.DocumentTemplateDataAgent).to(DocumentTemplateDataAgent)
iocContainer.bind<ProductDataAgent>(TYPES.ProductDataAgent).to(ProductDataAgent)
iocContainer.bind<CategoryDataAgent>(TYPES.CategoryDataAgent).to(CategoryDataAgent)
iocContainer.bind<TypeDataAgent>(TYPES.TypeDataAgent).to(TypeDataAgent)
iocContainer.bind<TemplateDataAgent>(TYPES.TemplateDataAgent).to(TemplateDataAgent)
iocContainer.bind<OutgoingRequestDataAgent>(TYPES.OutgoingRequestDataAgent).to(OutgoingRequestDataAgent)
iocContainer.bind<IncomingRequestDataAgent>(TYPES.IncomingRequestDataAgent).to(IncomingRequestDataAgent)
iocContainer.bind<ReceivedDocumentsDataAgent>(TYPES.ReceivedDocumentsDataAgent).to(ReceivedDocumentsDataAgent)
iocContainer.bind<SharedDocumentsDataAgent>(TYPES.SharedDocumentsDataAgent).to(SharedDocumentsDataAgent)

iocContainer.bind<ServiceUtils>(TYPES.ServiceUtils).to(ServiceUtils)

iocContainer.bind<ReceivedDocumentsService>(TYPES.ReceivedDocumentsService).to(ReceivedDocumentsService)
iocContainer.bind<RequestService>(TYPES.RequestService).to(RequestService)
iocContainer.bind<IncomingRequestService>(TYPES.IncomingRequestService).to(IncomingRequestService)
iocContainer.bind<SendDocumentsService>(TYPES.SendDocumentsService).to(SendDocumentsService)

iocContainer.bind<RequestClient>(TYPES.RequestClient).to(RequestClient)
iocContainer.bind<CompaniesRegistryClient>(TYPES.CompaniesRegistryClient).to(CompaniesRegistryClient)
iocContainer.bind<UsersRegistryClient>(TYPES.UsersRegistryClient).to(UsersRegistryClient)

iocContainer.bind<EventsRouter>(TYPES.EventsRouter).to(EventsRouter)

iocContainer
  .bind<NotificationManager>(TYPES.NotificationManager)
  .toConstantValue(new NotificationManager(process.env.API_NOTIF_BASE_URL))

iocContainer.bind<NotificationClient>(TYPES.NotificationClient).to(NotificationClient)

iocContainer.bind<TaskManager>(TYPES.TaskManager).toConstantValue(new TaskManager(process.env.API_NOTIF_BASE_URL))

iocContainer.bind<TaskClient>(TYPES.TaskClient).to(TaskClient)

iocContainer.bind<IService>(TYPES.DecoratorService).to(DecoratorService)
iocContainer.bind<IService>(TYPES.DocumentEventService).to(DocumentEventService)

iocContainer.bind<SignerApi>(TYPES.SignerClient).toDynamicValue(context => {
  const baseUrl = context.container.get<string>(CONFIG_KEYS.ApiBlockchainSignerUrl)

  return new SignerApi(undefined, baseUrl)
})

iocContainer.bind<MagicLinkService>(TYPES.MagicLinkService).to(MagicLinkService)

iocContainer.bind<string>(CONFIG_KEYS.CompanyStaticId).toConstantValue(process.env.COMPANY_STATIC_ID)

iocContainer.bind<string>(CONFIG_KEYS.KomgoWebAppUrl).toConstantValue(process.env.KOMGO_WEB_APP_URL || 'http://client')

iocContainer
  .bind<string>(CONFIG_KEYS.ApiRegistryUrl)
  .toConstantValue(process.env.API_REGISTRY_BASE_URL || 'http://api-registry')

iocContainer.bind<string>(CONFIG_KEYS.ApiUsersUrl).toConstantValue(process.env.API_USERS_BASE_URL || 'http://api-users')

iocContainer.bind<string>(CONFIG_KEYS.ApiNotifUrl).toConstantValue(process.env.API_NOTIF_BASE_URL || 'http://api-notif')

iocContainer
  .bind<string>(CONFIG_KEYS.ApiMagicLinkUrl)
  .toConstantValue(process.env.API_MAGIC_LINK_BASE_URL || 'http://api-magic-link')

iocContainer
  .bind<string>(CONFIG_KEYS.ConsumerId)
  .toConstantValue(process.env.INTERNAL_MQ_CONSUMER_ID || 'api-documents-consumer')

// Make to and from the same for 2 bindings below to test/run locally
iocContainer
  .bind<string>(CONFIG_KEYS.ToPublisherId)
  .toConstantValue(process.env.INTERNAL_MQ_TO_PUBLISHER_ID || 'to-event-mgnt')

iocContainer
  .bind<string>(CONFIG_KEYS.FromPublisherId)
  .toConstantValue(process.env.INTERNAL_MQ_FROM_PUBLISHER_ID || 'from-event-mgnt')

iocContainer.bind<string>(CONFIG_KEYS.InternalPublisherId).toConstantValue('documents')

iocContainer
  .bind<string>(CONFIG_KEYS.ToWebSocketPublisherId)
  .toConstantValue(process.env.WEB_SOCKET_TO_PUBLISHER_ID || 'websocket')

iocContainer.bind(CONFIG_KEYS.ApiSignerUrl).toConstantValue(process.env.API_SIGNER_BASE_URL || 'http://api-signer')

iocContainer.bind(CONFIG_KEYS.ApiBlockchainSignerBaseUrl).toConstantValue(process.env.API_BLOCKCHAIN_SIGNER_BASE_URL)

iocContainer
  .bind(CONFIG_KEYS.ApiBlockchainSignerUrl)
  .toConstantValue(process.env.API_BLOCKCHAIN_SIGNER_BASE_URL + '/v0')

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

iocContainer.bind<RabbitMQConsumingClient>(TYPES.RabbitMQConsumingClient).toDynamicValue(context => {
  const factory = context.container.get<ConsumerWatchdogFactory>(TYPES.ConsumerWatchdogFactory)
  const fromPublisherId = context.container.get<string>(CONFIG_KEYS.FromPublisherId)

  return new RabbitMQConsumingClient(
    fromPublisherId,
    [
      EVENT_NAME.RequestDocuments,
      EVENT_NAME.RequestDocumentsNote,
      EVENT_NAME.RequestDocumentsDismissedTypes,
      EVENT_NAME.SendDocumentFeedback,
      EVENT_NAME.SendDocuments
    ],
    factory
  )
})

iocContainer.bind<RabbitMQConsumingClient>(TYPES.RabbitMQConsumingClient).toDynamicValue(context => {
  const factory = context.container.get<ConsumerWatchdogFactory>(TYPES.ConsumerWatchdogFactory)
  const fromPublisherId = 'api-blockchain-signer'

  return new RabbitMQConsumingClient(
    fromPublisherId,
    [EVENT_NAME.BlockchainTransactionSuccess, EVENT_NAME.BlockchainTransactionError],
    factory
  )
})

iocContainer.bind<RabbitMQPublishingClient>(TYPES.RabbitMQPublishingClient).toDynamicValue(context => {
  const publisherId = context.container.get<string>(CONFIG_KEYS.ToPublisherId)
  const companyStaticId = context.container.get<string>(CONFIG_KEYS.CompanyStaticId)
  const messagingFactory = context.container.get<MessagingFactory>(TYPES.MessagingFactory)

  return new RabbitMQPublishingClient(publisherId, companyStaticId, messagingFactory)
})

iocContainer.bind<RabbitMQPublishingClient>(TYPES.RabbitMQInternalPublishingClient).toDynamicValue(context => {
  const publisherId = context.container.get<string>(CONFIG_KEYS.InternalPublisherId)
  const companyStaticId = context.container.get<string>(CONFIG_KEYS.CompanyStaticId)
  const messagingFactory = context.container.get<MessagingFactory>(TYPES.MessagingFactory)

  return new RabbitMQPublishingClient(publisherId, companyStaticId, messagingFactory)
})

iocContainer.bind(TYPES.DocumentProcessorUtils).to(DocumentProcessorUtils)
iocContainer.bind(TYPES.EventProcessor).to(DocumentRequestProcessor)
iocContainer.bind(TYPES.EventProcessor).to(DocumentRequestNoteProcessor)
iocContainer.bind(TYPES.EventProcessor).to(SendDocumentProcessor)
iocContainer.bind(TYPES.EventProcessor).to(DocumentFeedbackProcessor)
iocContainer.bind(TYPES.EventProcessor).to(TransactionResultProcessor)
iocContainer.bind(TYPES.DocumentRequestDismissTypeProcessor).to(DocumentRequestDismissTypeProcessor)
iocContainer.bind(TYPES.ConsumerWatchdogFactory).to(ConsumerWatchdogFactory)

iocContainer.bind(TYPES.Clock).to(Clock)

iocContainer.bind(TYPES.Uploader).to(Uploader)
// ===== WARNING =====
// Please keep this limit aligned with nginx client_max_body_size.
// Current default value is set to 40MB
const sizeLimit = 40 * 1024 * 1024
iocContainer
  .bind<number>(CONFIG_KEYS.ShareDocumentsSizeLimit)
  .toConstantValue(Number(process.env.SHARE_DOCUMENTS_SIZE_LIMIT) || sizeLimit)

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
