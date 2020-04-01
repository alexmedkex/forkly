const TYPES = {
  // Web3
  Web3Utils: Symbol.for('Web3Utils'),

  // Data layer
  KeyDataAgent: Symbol.for('KeyDataAgent'),
  AddrIndexDataAgent: Symbol.for('AddrIndexDataAgent'),
  TransactionDataAgent: Symbol.for('TransactionDataAgent'),

  // Business layer
  OneTimeSigner: Symbol.for('OneTimeSigner'),
  CompanyKeyProvider: Symbol.for('CompanyKeyProvider'),
  ETHKeyManager: Symbol.for('ETHKeyManager'),
  KeyMigration: Symbol.for('KeyMigration'),
  TransactionManager: Symbol.for('TransactionManager'),
  MessagingClient: Symbol.for('MessagingClient'),
  BlockchainContentionManager: Symbol.for('BlockchainContentionManager'),

  // External dependencies
  MessagingFactory: Symbol.for('MessagingFactory'),
  HealthChecker: Symbol.for('HealthChecker'),
  DataAccess: Symbol.for('DataAccess'),
  VaultClient: Symbol.for('VaultClient'),

  // Services
  DecoratorService: Symbol.for('DecoratorService'),
  TransactionSendService: Symbol.for('TransactionSendService'),
  PollingServiceFactory: Symbol.for('PollingServiceFactory')
}

export { TYPES }
