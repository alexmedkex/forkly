export enum ErrorName {
  // Service layer
  EventMQPublishError = 'EventMQPublishError',
  EventProcessingError = 'EventProcessingError',
  PrivateWhitelistEventProcessingError = 'PrivateWhitelistEventProcessingError',
  ReadingEventsError = 'ReadingEventsError',
  BlockNumberInconsistency = 'BlockNumberInconsistency',
  LastEventUndefined = 'LastEventUndefined',
  UnableToConnectOnStart = 'UnableToConnectOnStart',
  PrivateWhitelistBlockchainConnectionFailed = 'PrivateWhitelistBlockchainConnectionFailed',
  LastEventProcessedInitialisedError = 'LastEventProcessedInitialisedError',
  ReadyCheck = 'ReadyCheck',
  PublicAutoWhitelist = 'PublicAutoWhitelist',
  UnableToStartService = 'UnableToStartService',

  // Data layer
  BuildDatabaseIndex = 'BuildDatabaseIndexFailed',
  MongoValidationFailed = 'MongoValidationFailed',
  MongoDuplicateError = 'MongoDuplicateError',
  MongoError = 'MongoError',
  InvalidAddress = 'InvalidAddress',

  // Business layer
  QuorumGetTransactionDataFailed = 'QuorumGetTransactionDataFailed',
  QuorumGetTransactionInvalidResponse = 'QuorumGetTransactionInvalidResponse',
  BlacklistedContract = 'BlacklistedContract',
  NonConformingContract = 'NonConformingContract',
  ContractNotFound = 'ContractNotFound',
  CompanyRegistryRequest = 'CompanyRegistryRequest',
  MongoConnection = 'MongoConnection',
  EventLogDecodeError = 'EventLogDecodeError',

  // Other
  LightContractLibraryConfigContractCreation = 'LightContractLibraryConfigContractCreation',
  LightContractLibraryConfigContractCast = 'LightContractLibraryConfigContractCast'
}
