const TYPES = {
  // Data layer
  RequestForProposalDataAgent: Symbol.for('RequestForProposalDataAgent'),
  ActionDataAgent: Symbol.for('ActionDataAgent'),

  // Microservice clients
  CompanyRegistryClient: Symbol.for('CompanyRegistryClient'),

  // Business layer
  OutboundPublisher: Symbol.for('OutboundPublisher'),
  OutboundMessageFactory: Symbol.for('OutboundMessageFactory'),
  ReceiveInboundRequestUseCase: Symbol.for('ReceiveInboundRequestUseCase'),
  ReceiveInboundCorporateReplyUseCase: Symbol.for('ReceiveInboundCorporateReplyUseCase'),
  ReceiveInboundAcceptUseCase: Symbol.for('ReceiveInboundAcceptUseCase'),
  ReceiveInboundDeclineUseCase: Symbol.for('ReceiveInboundDeclineUseCase'),
  ReceiveInboundUseCaseFactory: Symbol.for('ReceiveInboundUseCaseFactory'),
  CreateRequestUseCase: Symbol.for('CreateRequestUseCase'),
  SendOutboundRequestUseCase: Symbol.for('SendOutboundRequestUseCase'),
  ReplyUseCase: Symbol.for('ReplyUseCase'),
  CreateFinancialInstitutionReplyUseCase: Symbol.for('CreateFinancialInstitutionReplyUseCase'),
  CreateAcceptUseCase: Symbol.for('CreateAcceptUseCase'),
  SendOutboundReplyUseCase: Symbol.for('SendOutboundReplyUseCase'),
  GetActionsUseCase: Symbol.for('GetActionsUseCase'),
  InternalPublisher: Symbol.for('InternalPublisher'),
  InternalMessageFactory: Symbol.for('InternalMessageFactory'),
  ActionFactory: Symbol.for('ActionFactory'),
  OutboundActionProcessor: Symbol.for('OutboundActionProcessor'),
  RFPValidator: Symbol.for('RFPValidator'),
  CreateDeclineUseCase: Symbol.for('CreateDeclineUseCase'),
  AutoDeclineUseCase: Symbol.for('AutoDeclineUseCase'),

  // Service layer
  InboundProcessorService: Symbol.for('InboundProcessorService'),

  // External dependencies
  HealthChecker: Symbol.for('HealthChecker'),
  DataAccess: Symbol.for('DataAccess'),
  MessagingFactory: Symbol.for('MessagingFactory'),
  AxiosInstance: Symbol.for('Axios')
}

export { TYPES }
