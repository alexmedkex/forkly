import { IRawTx } from './IRawTx'

export interface IRawPrivateTx extends IRawTx {
  privateFor: string[]
}
