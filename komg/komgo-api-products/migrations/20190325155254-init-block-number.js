'use strict'

module.exports = {
  up(db) {
    return db.collection('last-processed-block').insert({ lastProcessedBlock: 1 })
  },

  down(db, next) {
    next()
  }
}
