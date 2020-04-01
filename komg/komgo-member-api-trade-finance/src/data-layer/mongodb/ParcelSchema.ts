import { Schema } from 'mongoose'
import { ModeOfTransport } from '@komgo/types'

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
    enum: Object.values(ModeOfTransport),
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
  }
})
export { ParcelSchema }
