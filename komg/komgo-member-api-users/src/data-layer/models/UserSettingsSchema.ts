import { Schema } from 'mongoose'

export const UserSettingsSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  sendInformationNotificationsByEmail: {
    type: Boolean
  },

  sendTaskNotificationsByEmail: {
    type: Boolean
  }
})

UserSettingsSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id
    delete ret.id
    delete ret.__v
  }
})
