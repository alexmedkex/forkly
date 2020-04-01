export const TYPES = {
  DecoratorService: Symbol.for('DecoratorService'),
  Clock: Symbol.for('Clock'),

  // Grid FS
  GridFsProvider: Symbol.for('GridFsProvider'),
  GridFsWrapper: Symbol.for('GridFsWrapper'),

  // Controller
  ControllerUtils: Symbol.for('ControllerUtils'),

  // Data agents
  ProductDataAgent: Symbol.for('ProductDataAgent'),
  CategoryDataAgent: Symbol.for('CategoryDataAgent'),
  DocumentDataAgent: Symbol.for('DocumentDataAgent'),
  DocumentTemplateDataAgent: Symbol.for('DocumentTemplateDataAgent'),
  ReceivedDocumentsDataAgent: Symbol.for('ReceivedDocumentsDataAgent'),
  SharedDocumentsDataAgent: Symbol.for('SharedDocumentsDataAgent'),
  OutgoingRequestDataAgent: Symbol.for('OutgoingRequestDataAgent'),
  IncomingRequestDataAgent: Symbol.for('IncomingRequestDataAgent'),
  TemplateDataAgent: Symbol.for('TemplateDataAgent'),
  TypeDataAgent: Symbol.for('TypeDataAgent'),

  // Services
  IncomingRequestService: Symbol.for('IncomingRequestService'),
  ReceivedDocumentsService: Symbol.for('ReceivedDocumentsService'),
  RequestService: Symbol.for('RequestService'),
  DocumentEventService: Symbol.for('DocumentEventService'),
  SendDocumentsService: Symbol.for('SendDocumentsService'),
  MagicLinkService: Symbol.for('MagicLinkService'),
  ServiceUtils: Symbol.for('ServiceUtils'),

  // Documents generation
  DocumentTemplateCompiler: Symbol.for('DocumentTemplateCompiler'),
  DocumentGenerator: Symbol.for('DocumentGenerator'),

  Uploader: Symbol.for('Uploader'),

  CompaniesRegistryClient: Symbol.for('CompaniesRegistryClient'),
  UsersRegistryClient: Symbol.for(`UsersRegistryClient`),

  // Notification
  NotificationClient: Symbol.for('NotificationClient'),
  NotificationManager: Symbol.for('NotificationManager'),

  // Tasks
  TaskClient: Symbol.for('TaskClient'),
  TaskManager: Symbol.for('TaskManager'),

  // Messaging
  RequestClient: Symbol.for('RequestClient'),
  MessagingFactory: Symbol.for('MessagingFactory'),
  EventsRouter: Symbol.for('EventsRouter'),
  EventProcessor: Symbol.for('EventProcessor'),
  SendDocumentProcessor: Symbol.for('SendDocumentProcessor'),
  DocumentRequestDismissTypeProcessor: Symbol.for('DocumentRequestDismissTypeProcessor'),
  DocumentProcessorUtils: Symbol.for('DocumentProcessorUtils'),

  // RabbitMQ
  RabbitMQConsumingClient: Symbol.for('RabbitMQConsumingClient'),
  RabbitMQPublishingClient: Symbol.for('RabbitMQPublishingClient'),
  RabbitMQInternalPublishingClient: Symbol.for('RabbitMQInternalPublishingClient'),
  ConsumerWatchdogFactory: Symbol.for('ConsumerWatchdogFactory'),
  MessagePublisher: Symbol.for('MessagePublisher'),

  DocumentsTransactionManagerProvider: Symbol.for('DocumentsTransactionManagerProvider'),

  // Blockchain
  Web3Instance: Symbol.for('Web3Instance'),
  SignerClient: Symbol.for('SignerClient')
}
