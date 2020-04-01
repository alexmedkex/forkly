'use strict'

const COLLECTION_NAME = 'types'

const sblcType = {
  productId: 'tradeFinance',
  categoryId: 'trade-finance-documents',
  _id: 'sblc',
  name: 'SBLC',
  vaktId: 'SBLC',
  fields: null,
  _v: 0,
  predefined: true
}

module.exports = {
  async up(db) {
    await db.collection(COLLECTION_NAME).insert(sblcType)
  },

  async down(db) {
    await db.collection(COLLECTION_NAME).remove({ id: sblcType.id })
  }
}
