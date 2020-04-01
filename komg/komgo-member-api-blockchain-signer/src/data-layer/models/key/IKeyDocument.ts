import mongoose from 'mongoose'

export interface IKeyDocument extends mongoose.Document {
  id: string
  type: string
  data: string
  active: boolean
  validFrom: Date
  validTo?: Date
  createdAt: Date
  modifiedAt: Date
}
