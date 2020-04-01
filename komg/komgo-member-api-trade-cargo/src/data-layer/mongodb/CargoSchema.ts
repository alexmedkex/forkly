import { Schema } from 'mongoose'
import { ParcelSchema } from './ParcelSchema'
import { CARGO_SCHEMA_VERSION } from '@komgo/types'

const CargoSchema: Schema = new Schema(
  {
    source: {
      type: String,
      required: true
    },
    sourceId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    grade: {
      type: String,
      required: false
    },
    cargoId: {
      type: String,
      required: true
    },
    parcels: {
      type: [ParcelSchema],
      required: true
    },
    quality: {
      type: String
    },
    originOfGoods: {
      type: String
    },
    version: {
      type: Number,
      enum: Object.values(CARGO_SCHEMA_VERSION),
      default: CARGO_SCHEMA_VERSION.V1 // TODO LS are we fine with that?
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    deletedAt: {
      type: Date
    }
  },
  { timestamps: true }
)

export default CargoSchema
