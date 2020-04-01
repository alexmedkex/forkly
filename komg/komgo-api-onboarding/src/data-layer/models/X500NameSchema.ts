import { Schema } from 'mongoose'

const X500NameSchema: Schema = new Schema(
  {
    O: {
      type: String,
      required: true
    },
    C: {
      type: String,
      required: true
    },
    L: {
      type: String,
      required: true
    },
    STREET: {
      type: String,
      required: true
    },
    PC: {
      type: String,
      required: true
    }
  },
  { _id: false }
)

export default X500NameSchema
