import { Schema } from 'mongoose'

const NotificationSchema: Schema = new Schema(
  {
    productId: {
      type: String,
      required: true
    },

    type: {
      type: String,
      required: true
    },

    level: {
      type: String,
      enum: ['success', 'info', 'warning', 'danger'],
      required: true
    },

    isRead: {
      type: Boolean,
      default: false
    },

    toUser: {
      type: String,
      required: true
    },

    context: {
      type: Object,
      required: true
    },

    message: {
      type: String,
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false
  }
)

NotificationSchema.index({
  createdAt: 1
})

export default NotificationSchema
