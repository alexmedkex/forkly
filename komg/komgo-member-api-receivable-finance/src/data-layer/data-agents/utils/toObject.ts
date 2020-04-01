import Mongoose from 'mongoose'

export const toObject = (document: Mongoose.Document) => {
  return document ? document.toObject({ versionKey: false }) : null
}
