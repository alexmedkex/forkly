const TYPES = {
  MessagingFactory: Symbol.for('MessagingFactory'),
  ConsumerWatchdogFactory: Symbol.for('ConsumerWatchdogFactory'),
  NotificationClient: Symbol.for('NotificationClient'),
  TaskManagerClient: Symbol.for('TaskManagerClient'),
  CoverageEventProcessor: Symbol.for('CoverageEventProcessor'),
  CompanyClient: Symbol.for('CompanyRegistryClient'),
  RequestClient: Symbol.for('RequestClient'),
  EventsProcessor: Symbol.for('EventsProcessor'),
  EventProcessor: Symbol.for('EventProcessor'),
  CompanyCoverageDataAgent: Symbol.for('CompanyCoverageDataAgent'),
  CounterpartyProfileDataAgent: Symbol.for('CounterpartyProfileDataAgent'),
  CounterpartyService: Symbol.for('CounterpartyService')
}

export { TYPES }
