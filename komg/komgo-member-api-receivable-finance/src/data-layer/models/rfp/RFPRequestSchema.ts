import { Schema } from 'mongoose'

const RFPRequestSchema: Schema = new Schema(
  {
    rfpId: {
      type: String,
      required: true,
      unique: true
    },
    rdId: {
      type: String,
      required: true,
      unique: true
    },
    senderStaticid: {
      type: String,
      required: false
    },
    participantStaticIds: {
      type: [String],
      required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    toObject: {
      transform(doc, ret) {
        delete ret._id
      }
    },
    toJSON: {
      transform(doc, ret) {
        delete ret._id
      }
    }
  }
)

export default RFPRequestSchema
