export enum TransactionStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Failed = 'failed', //TODO: review this state. When this is actually failed?
  Reverted = 'reverted'
}
