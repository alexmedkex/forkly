import { Schema } from 'mongoose'

const EthereumPublicKey: Schema = new Schema(
  {
    validFrom: {
      type: String,
      required: true
    },
    validTo: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    key: {
      type: String,
      required: true
    }
  },
  { _id: false }
)

export default EthereumPublicKey
