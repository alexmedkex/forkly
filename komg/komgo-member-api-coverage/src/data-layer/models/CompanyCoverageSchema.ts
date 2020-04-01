import { Schema } from 'mongoose'
const CompanyCoverageSchema: Schema = new Schema({
  companyId: {
    type: String,
    required: true
  },
  covered: {
    type: Boolean,
    required: false
  },
  coverageRequestId: {
    type: String,
    required: false
  },
  coverageRequestedOn: {
    type: Date,
    required: false
  },
  coverageApprovedOn: {
    type: Date,
    required: false
  },
  coverageRejectedOn: {
    type: Date,
    required: false
  },
  coverageAutoAddedOn: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  }
})
export default CompanyCoverageSchema
