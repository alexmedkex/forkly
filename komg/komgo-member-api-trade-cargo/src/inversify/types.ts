const TYPES = {
  TradeDataAgent: Symbol.for('TradeDataAgent'),
  CargoDataAgent: Symbol.for('CargoDataAgent'),
  TradeEventService: Symbol.for('TradeEventService'),
  MessagingFactory: Symbol.for('MessagingFactory'),
  NotificationClient: Symbol.for('NotificationClient'),
  TradeEventProcessor: Symbol.for('TradeEventProcessor'),
  CargoEventProcessor: Symbol.for('CargoEventProcessor'),
  MemberClient: Symbol.for('MemberClient'),
  CounterpartyClient: Symbol.for('CounterpartyClient'),
  PollingServiceFactory: Symbol.for('PollingServiceFactory'),
  TradeValidator: Symbol.for('TradeValidator'),
  CargoValidator: Symbol.for('CargoValidator'),
  DocumentServiceClient: Symbol.for('DocumentServiceClient'),
  TradeFinanceServiceClient: Symbol.for('TradeFinanceServiceClient'),
  EventMessagePublisher: Symbol.for('EventMessagePublisher'),
  TradeValidationService: Symbol.for('TradeValidationService'),
  CargoUpdateMessageUseCase: Symbol.for('CargoUpdateMessageUseCase'),
  TradeUpdateMessageUseCase: Symbol.for('TradeUpdateMessageUseCase')
}

export { TYPES }
