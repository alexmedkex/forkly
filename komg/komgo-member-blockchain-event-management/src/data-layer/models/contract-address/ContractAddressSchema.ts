import mongoose from 'mongoose'

import { ContractAddressStatus } from './ContractAddressStatus'

export const ContractAddressSchema: mongoose.Schema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      index: { unique: true }
    },
    status: {
      type: ContractAddressStatus,
      required: true
    },
    txHash: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
)
