import * as mongoose from 'mongoose'

export interface IX500NameDocument extends mongoose.Document {
  CN: string
  O: string
  C: string
  L: string
  STREET: string
  PC: string
}
