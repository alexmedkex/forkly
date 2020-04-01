import { Schema } from 'mongoose'
import { ModeOfTransport, PARCEL_SCHEMA_VERSION, TRADE_SCHEMA_VERSION } from '@komgo/types'

const ParcelSchema: Schema = new Schema({
  id: {
    type: String,
    required: true
  },
  laycanPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  modeOfTransport: {
    type: String,
    required: false
  },
  vesselIMO: {
    type: Number,
    required: false
  },
  vesselName: {
    type: String,
    required: false
  },
  loadingPort: {
    type: String,
    required: false
  },
  dischargeArea: {
    type: String,
    required: false
  },
  inspector: {
    type: String,
    required: false
  },
  deemedBLDate: {
    type: Date,
    required: false
  },
  quantity: {
    type: Number,
    required: true
  },
  loadingPlace: {
    type: String
  },
  destinationPlace: {
    type: String
  },
  tankFarmOperatorName: {
    type: String
  },
  pipelineName: {
    type: String
  },
  warehouseOperatorName: {
    type: String
  },
  version: {
    type: Number,
    enum: Object.values(PARCEL_SCHEMA_VERSION),
    default: PARCEL_SCHEMA_VERSION.V1 // TODO LS are we fine with that?
  }
})
export { ParcelSchema }
