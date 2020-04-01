const TRADES_COLLECTION = 'trades'
module.exports = {
  async up(db) {
    await db
      .collection(TRADES_COLLECTION)
      .createIndex({ buyerEtrmId: 1 }, { partialFilterExpression: { buyerEtrmId: { $exists: true } } })

    await db
      .collection(TRADES_COLLECTION)
      .createIndex({ sellerEtrmId: 1 }, { partialFilterExpression: { sellerEtrmId: { $exists: true } } })
  },

  async down(db) {
    await db.collection(TRADES_COLLECTION).dropIndex('buyerEtrmId_1')
    await db.collection(TRADES_COLLECTION).dropIndex('sellerEtrmId_1')
  }
}
