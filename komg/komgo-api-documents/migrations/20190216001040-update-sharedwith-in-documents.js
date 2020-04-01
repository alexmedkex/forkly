'use strict';

module.exports = {
  async up(db, next) {
    await db.collection('documents').find().forEach(doc => {
      if (Array.isArray(doc.sharedWith) && doc.sharedWith.every(verifyOldSharedWithFormat)){
        return db.collection('documents').updateOne({_id: doc._id}, {$set: {'sharedWith': transformToNewSharedWith(doc)}})
      } else{
        return next('documents have not the format required')
      }
    }).then(() => {
      return next()
    }).catch(err => next(err))
  },

  async down(db, next) {
    await db.collection('documents').find().forEach(doc => {
      if (Array.isArray(doc.sharedWith) && doc.sharedWith.every(verifyNewSharedWithFormat)){
        return db.collection('documents').updateOne({_id: doc._id}, {$set: {'sharedWith': transformToOldSharedWith(doc)}})
      } else{
        return next('documents have not the format required')
      }
    }).then(() => {
      return next()
    }).catch(err => next(err))
  }
}

function verifyOldSharedWithFormat(oldSharedWithElement) {
  return (typeof oldSharedWithElement === 'string' || oldSharedWithElement instanceof String)
}

function verifyNewSharedWithFormat(newSharedWithElement) {
  return newSharedWithElement.hasOwnProperty('counterpartyId') && newSharedWithElement.hasOwnProperty('sharedDates')
}

function transformToNewSharedWith(document) {
  const oldSharedWith = document.sharedWith
  return oldSharedWith.map(s => {return {"counterpartyId": s, "sharedDates":[new Date()]}})
}

function transformToOldSharedWith(document) {
  const newSharedWith = document.sharedWith
  return newSharedWith.map(s => s.counterpartyId)
}