import { Schema } from 'mongoose'

export const UploadInfoSchema: Schema = new Schema(
  {
    transactionId: {
      type: String,
      index: true,
      required: false
    },
    uploaderUserId: {
      type: String,
      required: false
    }
  },
  { _id: false }
)
