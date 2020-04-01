import Mongoose from 'mongoose'

export const toObject = (document: Mongoose.Document) => {
  return document ? clean(document.toObject({ versionKey: false })) : null
}

function clean(obj) {
  for (const propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName]
    }
  }
  return obj
}
