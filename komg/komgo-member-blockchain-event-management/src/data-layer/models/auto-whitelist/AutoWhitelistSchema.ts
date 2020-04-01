import mongoose from 'mongoose'

export const AutoWhitelistSchema: mongoose.Schema = new mongoose.Schema({
  startBlockNumber: {
    type: Number,
    required: false,
    default: 0
  },
  stopBlockNumber: {
    type: Number,
    required: false
  }
})
