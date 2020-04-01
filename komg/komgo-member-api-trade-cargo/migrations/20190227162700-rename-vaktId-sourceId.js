'use strict'
const TRADES_COLLECTION = 'trades'
const CARGO_COLLECTION = 'cargos'

module.exports = {
  async up(db, next) {
    await db.collection(TRADES_COLLECTION).dropIndex('source_1_vaktId_1_deletedAt_1')
    await db.collection(TRADES_COLLECTION).updateMany({}, { $rename: { vaktId: 'sourceId' } })
    await db.collection(TRADES_COLLECTION).createIndex({ source: 1, sourceId: 1, deletedAt: 1 }, { unique: true })

    await db.collection(CARGO_COLLECTION).updateMany({}, { $rename: { vaktId: 'sourceId' } })

    next()
  },

  async down(db, next) {
    await db.collection(TRADES_COLLECTION).dropIndex('source_1_sourceId_1_deletedAt_1')
    await db.collection(TRADES_COLLECTION).updateMany({}, { $rename: { sourceId: 'vaktId' } })

    await db.collection(CARGO_COLLECTION).updateMany({}, { $rename: { sourceId: 'vaktId' } })

    next()
  }
}
