import { Schema } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { FieldType } from '../../../FieldTypes'
import { enumValues } from '../../../utils'

const TypeFieldSchema: Schema = new Schema({
  _id: {
    type: String,
    default: uuid4,
    alias: 'id'
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: enumValues(FieldType)
  },
  isArray: {
    type: Boolean,
    required: true
  }
})

export { TypeFieldSchema }
