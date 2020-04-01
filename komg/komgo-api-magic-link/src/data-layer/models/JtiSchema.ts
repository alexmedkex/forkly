import { Schema } from 'mongoose'

export const JtiSchema: Schema = new Schema({
  jti: {
    type: String,
    index: {
      unique: true
    }
  }
})
