'use strict'

const RD_COLLECTION = 'receivables-discountings'

module.exports = {
  async up(db, next) {
    await dropIndexesIfPresent(db)

    // recreate without the unique constraint
    console.log('creating indexes')
    await db.collection(RD_COLLECTION).createIndex({ staticId: 1 })
    await db.collection(RD_COLLECTION).createIndex({ 'tradeReference.sellerEtrmId': 1 })
    await db.collection(RD_COLLECTION).createIndex({ 'tradeReference.sourceId': 1 })
    next()
  },

  async down(db, next) {
    await dropIndexesIfPresent(db)

    console.log('creating indexes')
    await db.collection(RD_COLLECTION).createIndex({ staticId: 1 }, { unique: true })
    await db.collection(RD_COLLECTION).createIndex({ 'tradeReference.sellerEtrmId': 1 }, { unique: true })
    await db.collection(RD_COLLECTION).createIndex({ 'tradeReference.sourceId': 1 }, { unique: true })

    next()
  }
}

async function dropIndexesIfPresent(db) {
  const indexes = await db.collection(RD_COLLECTION).indexes()
  for (let index of indexes) {
    if (
      index.name === 'staticId_1' ||
      index.name === 'tradeReference.sellerEtrmId_1' ||
      index.name === 'tradeReference.sourceId_1'
    ) {
      console.log(`found ${index.name} - dropping index`)
      await db.collection(RD_COLLECTION).dropIndex(index.name)
    }
  }
}
