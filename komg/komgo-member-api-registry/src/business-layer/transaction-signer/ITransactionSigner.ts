import { TransactionSignResult } from '../../data-layer/models/TransactionSignResult'

export interface ITransactionSigner {
  sendTransaction(tx: any): Promise<TransactionSignResult>
}
