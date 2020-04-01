export enum Metric {
  BlockchainEventProcessed = 'blockchainEventProcessed',
  Address = 'address',
  Action = 'action',
  Validation = 'validation',
  AutoWhitelist = 'autoWhitelist',
  AutoWhitelistType = 'autoWhitelistType'
}

export enum Action {
  Blacklisted = 'blacklisted',
  Whitelisted = 'whitelisted'
}

export enum Validation {
  BytecodeNotRecognised = 'bytecodeNotRecognised',
  BytecodeVersionNotActivated = 'bytecodeVersionNotRecognised',
  InvalidEventEmitted = 'invalidEventEmitted'
}

export enum AutoWhitelistType {
  Private = 'private',
  Public = 'public'
}
