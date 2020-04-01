import { Schema } from 'mongoose'

const Key: Schema = new Schema(
  {
    kty: {
      type: String,
      required: true
    },
    kid: {
      type: String,
      required: true
    },
    e: {
      type: String,
      required: true
    },
    n: {
      type: String,
      required: true
    }
  },
  { _id: false }
)

const MessagingPublicKey: Schema = new Schema(
  {
    validFrom: {
      type: String,
      required: true
    },
    validTo: {
      type: String,
      required: true
    },
    key: {
      type: Key,
      required: true
    }
  },
  { _id: false }
)

export default MessagingPublicKey
