import { Schema } from 'mongoose'

export const CustomerSchema: Schema = new Schema(
  {
    products: {
      type: [Schema.Types.String],
      required: true
    },
    memberStaticId: {
      type: String,
      required: true,
      index: true,
      unique: true
    },
    memberNodeId: {
      type: String,
      required: true
    },
    blockHeight: {
      type: Number,
      required: false
    }
  },
  {
    versionKey: false
  }
)

CustomerSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id
    delete ret.id
  }
})
