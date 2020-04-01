import { Schema } from 'mongoose'

export const DeactivatedDocumentSchema: Schema = new Schema({
  hash: {
    type: String,
    index: {
      unique: true
    }
  }
})
