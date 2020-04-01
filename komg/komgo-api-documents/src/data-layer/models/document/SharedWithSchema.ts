import { Schema } from 'mongoose'

export const SharedWithSchema: Schema = new Schema(
  {
    counterpartyId: String,
    sharedDates: [Date]
  },
  { _id: false }
)
