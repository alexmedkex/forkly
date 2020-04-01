import { Schema } from 'mongoose'

export const LastProcessedBlockSchema: Schema = new Schema(
  {
    lastProcessedBlock: {
      type: Number,
      required: true,
      index: true,
      unique: true
    }
  },
  {
    collection: 'last-processed-block',
    versionKey: false
  }
)

LastProcessedBlockSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id
    delete ret.id
  }
})
