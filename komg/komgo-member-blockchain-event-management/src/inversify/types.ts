const TYPES = {
  // Web3
  Web3Instance: Symbol.for('Web3Instance'),

  // Data layer
  EventProcessedDataAgent: Symbol.for('EventProcessedDataAgent'),
  ContractAddressDataAgent: Symbol.for('ContractAddressDataAgent'),
  ContractLibraryDataAgent: Symbol.for('ContractLibraryDataAgent'),
  AutoWhitelistDataAgent: Symbol.for('AutoWhitelistDataAgent'),

  // Service layer
  RunnerService: Symbol.for('RunnerService'),
  PollingServiceFactory: Symbol.for('PollingServiceFactory'),
  BlockchainEventService: Symbol.for('BlockchainEventService'),
  PublicAutoWhitelistService: Symbol.for('PublicAutoWhitelistService'),
  PrivateAutoWhitelistService: Symbol.for('PrivateAutoWhitelistService'),

  // Business layer
  EventValidator: Symbol.for('EventValidator'),
  ContractCastVerifier: Symbol.for('ContractCastVerifier'),
  BytecodeVerifier: Symbol.for('BytecodeVerifier'),
  PublicAutoWhitelister: Symbol.for('PublicAutoWhitelister'),
  CompanyRegistryClient: Symbol.for('CompanyRegistryClient'),
  PrivateAutoWhitelister: Symbol.for('PrivateAutoWhitelister'),
  QuorumClient: Symbol.for('QuorumClient'),

  // External dependencies and others
  MessagingFactory: Symbol.for('MessagingFactory'),
  IsReadyChecker: Symbol.for('IsReadyChecker'),

  // Monitoring
  Server: Symbol.for('Server'),
  Express: Symbol.for('Express'),
  HttpServer: Symbol.for('HttpServer')
}

export { TYPES }
