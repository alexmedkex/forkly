export interface IPostPrivateTransaction {
  from: string
  data: string
  value: string
  privateFor: string[]
  // "to" field can be empty when deploying a new private smart contract
  to?: string
  gas?: number
}

export const VAULT_MNEMONIC_PATH = 'mnemonic'
