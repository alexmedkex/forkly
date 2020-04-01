import * as mongoose from 'mongoose'

export interface ICompanyCoverageDocument extends mongoose.Document {
  companyId?: string
  covered?: boolean
  coverageRequestId?: string
  coverageRequestedOn?: Date
  coverageApprovedOn?: Date
  coverageRejectedOn?: Date
  coverageAutoAddedOn?: Date
  status: string
  description?: string
}
