import { ActionType, ActionStatus } from '@komgo/types'
import { Schema } from 'mongoose'

const ActionSchema: Schema = new Schema({
  staticId: {
    type: String,
    required: true,
    unique: true
  },
  rfpId: {
    type: Object,
    required: true
  },
  recipientStaticID: {
    type: String,
    required: true
  },
  senderStaticID: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date
  },
  type: {
    type: String,
    enum: Object.values(ActionType),
    required: true
  },
  taskActionId: {
    type: String
  },
  status: {
    type: String,
    enum: Object.values(ActionStatus),
    required: true
  },
  data: {
    type: Object,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default ActionSchema
export { ActionSchema }
