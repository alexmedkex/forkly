import mongoose from 'mongoose'

export const EventProcessedSchema: mongoose.Schema = new mongoose.Schema({
  blockNumber: {
    type: Number,
    required: true
  },
  transactionHash: {
    type: String,
    required: true
  },
  logIndex: {
    type: Number,
    required: true
  }
})
