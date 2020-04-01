'use strict'

var dropIndexesIfPresent = require('./utils').dropIndexesIfPresent

const QUOTES_COLLECTION = 'quotes'

module.exports = {
  async up(db, next) {
    await dropIndexesIfPresent(db, QUOTES_COLLECTION, ['staticId_1'])
    await db.collection(QUOTES_COLLECTION).createIndex({ staticId: 1 })
    next()
  },

  async down(db, next) {
    await dropIndexesIfPresent(db, QUOTES_COLLECTION, ['staticId_1'])
    await db.collection(QUOTES_COLLECTION).createIndex({ staticId: 1 }, { unique: true })
    next()
  }
}
