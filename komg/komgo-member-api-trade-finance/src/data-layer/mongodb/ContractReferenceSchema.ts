import { Schema } from 'mongoose'

export const ContractReferenceSchema: Schema = new Schema(
  {
    contractAddress: {
      type: String,
      required: false
    },
    transactionHash: {
      type: String,
      required: false
    },
    key: {
      type: String
    }
  },
  { _id: false }
)
