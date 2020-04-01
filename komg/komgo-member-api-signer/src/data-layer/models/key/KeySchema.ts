import { Schema } from 'mongoose'

/**
 * MongooseSchema
 * @type {"mongoose".Schema}
 * @private
 */
const KeySchema: Schema = new Schema({
  type: {
    type: String,
    required: true
  },
  data: {
    type: String,
    required: true
  },

  validFrom: Date,
  validTo: Date,
  active: Boolean,

  createdAt: {
    type: Date,
    default: Date.now
  },

  modifiedAt: {
    type: Date,
    default: Date.now
  }
})

export { KeySchema }
