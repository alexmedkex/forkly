import { Schema } from 'mongoose'

export const DocumentTemplateContentSchema: Schema = new Schema({
  fileId: {
    type: String,
    required: true
  }
})
