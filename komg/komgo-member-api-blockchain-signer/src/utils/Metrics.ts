export enum TransactionType {
  Private = 'private',
  Public = 'public'
}

export enum CryptographyType {
  Eth = 'eth'
}

export enum CryptographyFunction {
  Sign = 'sign',
  Verify = 'verify',
  Encrypt = 'encrypt',
  Decrypt = 'decrypt'
}

export enum Metric {
  TransactionType = 'transactionType',
  TransactionState = 'transactionState',
  CryptographyType = 'cryptographyType',
  CryptographyFunction = 'cryptographyFunction'
}
