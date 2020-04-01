import { Schema } from 'mongoose'

const RequestForProposalSchema: Schema = new Schema({
  staticId: {
    type: String,
    required: true,
    unique: true
  },
  context: {
    type: Object,
    required: true
  },
  productRequest: {
    type: Object,
    required: true
  },
  documentIds: {
    type: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default RequestForProposalSchema
export { RequestForProposalSchema }
