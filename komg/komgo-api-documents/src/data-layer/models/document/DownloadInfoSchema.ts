import { Schema } from 'mongoose'

export const DownloadInfoSchema: Schema = new Schema(
  {
    downloadedByUsers: {
      type: [String],
      required: false
    }
  },
  { _id: false }
)
