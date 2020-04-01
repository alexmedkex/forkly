import { RiskLevel } from './enums'
import * as mongoose from 'mongoose'

export interface ICounterpartyProfile extends mongoose.Document {
  id: string
  counterpartyId: string
  riskLevel: RiskLevel
  renewalDate: Date
  managedById: string
}
