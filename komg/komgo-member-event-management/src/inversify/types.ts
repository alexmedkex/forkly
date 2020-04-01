const TYPES = {
  EnvelopeAgent: Symbol.for('EnvelopeAgent'),
  CommonMessagingAgent: Symbol.for('CommonMessagingAgent'),
  DecoratorService: Symbol.for('DecoratorService'),
  SignerAgent: Symbol.for('SignerAgent'),
  MessagingFactory: Symbol.for('MessagingFactory'),
  PollingServiceFactory: Symbol.for('PollingServiceFactory'),
  CommonToInternalForwardingService: Symbol.for('CommonToInternalForwardingService'),
  InternalToCommonForwardingService: Symbol.for('InternalToCommonForwardingService'),
  CompanyRegistryAgent: Symbol.for('CompanyRegistryAgent'),
  BackoffTimer: Symbol.for('BackoffTimer'),
  CommonBrokerMessageDataAgent: Symbol.for('CommonBrokerMessageDataAgent'),
  AuditingService: Symbol.for('AuditingService'),
  IsReadyChecker: Symbol.for('IsReadyChecker'),
  RequestIdHandler: Symbol.for('RequestIdHandler'),

  Server: Symbol.for('Server'),
  Express: Symbol.for('Express'),
  HttpServer: Symbol.for('HttpServer')
}

export { TYPES }
