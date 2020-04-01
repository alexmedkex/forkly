import { Schema } from 'mongoose'

export const OwnerSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    companyId: {
      type: String,
      required: true
    }
  },
  { _id: false }
)
