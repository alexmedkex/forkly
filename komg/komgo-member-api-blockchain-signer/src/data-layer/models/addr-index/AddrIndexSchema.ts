import { Schema } from 'mongoose'

/**
 * MongooseSchema
 * @type {"mongoose".Schema}
 * @private
 */
const AddrIndexSchema: Schema = new Schema(
  {
    mnemonicHash: {
      type: String,
      required: true
    },
    addrIndex: {
      type: Number,
      required: true
    }
  },
  {
    versionKey: false
  }
)

export { AddrIndexSchema }
