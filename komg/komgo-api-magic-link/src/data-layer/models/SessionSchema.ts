import { Schema } from 'mongoose'

export const SessionSchema: Schema = new Schema({
  sessionId: {
    type: String,
    required: true
  },

  staticId: {
    type: String,
    required: true
  },

  merkle: {
    type: String
  },

  metadataHash: {
    type: String
  },

  timestamp: {
    type: String
  },

  activated: {
    type: Boolean
  }
})
