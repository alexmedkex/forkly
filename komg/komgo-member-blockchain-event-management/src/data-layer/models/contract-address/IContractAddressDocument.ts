import mongoose from 'mongoose'

import { ContractAddressStatus } from './ContractAddressStatus'

export interface IContractAddressDocument extends mongoose.Document {
  address: string
  status: ContractAddressStatus
  txHash: string
}
