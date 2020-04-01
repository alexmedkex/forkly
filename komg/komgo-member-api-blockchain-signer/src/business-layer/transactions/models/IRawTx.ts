export interface IRawTx {
  from: string
  gas: number
  gasPrice: string
  data: string
  to?: string
  value?: string
  nonce?: number
}
