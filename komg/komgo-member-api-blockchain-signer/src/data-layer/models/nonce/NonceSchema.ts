import { Schema } from 'mongoose'

/**
 * MongooseSchema
 * @type {"mongoose".Schema}
 * @private
 */
const NonceSchema: Schema = new Schema({
  address: {
    type: String,
    required: true
  },
  nonce: {
    type: Number,
    required: true
  }
})

export { NonceSchema }
