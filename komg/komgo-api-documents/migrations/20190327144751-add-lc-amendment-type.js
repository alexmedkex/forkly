'use strict'

const COLLECTION_NAME = 'types'

const lcAmendmentType = {
  productId: 'tradeFinance',
  categoryId: 'trade-finance-documents',
  _id: 'lcAmendment',
  name: 'L/C Amendment',
  vaktId: 'LC_AMENDMENT',
  fields: null,
  _v: 0,
  predefined: true
}

module.exports = {
  async up(db) {
    await db.collection(COLLECTION_NAME).insert(lcAmendmentType)
  },

  async down(db) {
    await db.collection(COLLECTION_NAME).remove({ id: lcAmendmentType.id })
  }
}
