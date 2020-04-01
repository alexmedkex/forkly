import { Schema } from 'mongoose'

import MessagingPublicKey from './MessagingPublicKey'

const VaktInfoSchema: Schema = new Schema(
  {
    staticId: {
      type: String,
      required: true
    },
    mnid: {
      type: String,
      required: true
    },
    messagingPublicKey: {
      type: MessagingPublicKey,
      required: true
    }
  },
  { _id: false }
)

export default VaktInfoSchema
