'use strict'

var createTypes = require('../src/migration-utils').createTypes
var createType = require('../src/migration-utils').createType

const COLLECTION_NAME_TYPES = 'types'

const CATEGORY_ID = 'receivables-discounting-documents'
const PRODUCT_ID = 'tradeFinance'

const types = createTypes(PRODUCT_ID, CATEGORY_ID, [
  createType('proofOfPerformance', 'Proof of Performance'),
  createType('proofOfTradeAcceptance', 'Proof of Trade Acceptance')
])

module.exports = {
  async up(db) {
    for (const type of types) {
      await db.collection(COLLECTION_NAME_TYPES).insertOne(type)
    }
  },

  async down(db) {
    for (const type of types) {
      await db.collection(COLLECTION_NAME_TYPES).remove({ id: type.id })
    }
  }
}
