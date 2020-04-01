'use strict'

var dropIndexesIfPresent = require('./utils').dropIndexesIfPresent

const COLLECTION = 'trade-snapshots'

module.exports = {
  async up(db, next) {
    await dropIndexesIfPresent(db, COLLECTION, ['sourceId_1'])
    await db.collection(COLLECTION).createIndex({ sourceId: 1 })
    next()
  },

  async down(db, next) {
    await dropIndexesIfPresent(db, COLLECTION, ['sourceId_1'])
    await db.collection(COLLECTION).createIndex({ sourceId: 1 }, { unique: true })
    next()
  }
}
