import { TransactionReceipt } from 'web3-core'

export interface ITransaction {
  id: string
  nonce: number
  from: string
  body: any
  hash: string
  status: string
  mined: boolean
  receipt: TransactionReceipt
  requestOrigin: string
  attempts: number
  context?: object
}
