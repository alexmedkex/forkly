'use strict'

var createTypes = require('../src/migration-utils').createTypes
var createType = require('../src/migration-utils').createType

const COLLECTION_NAME_TYPES = 'types'

const CATEGORY_ID = 'receivables-discounting-documents'
const PRODUCT_ID = 'tradeFinance'

const types = createTypes(PRODUCT_ID, CATEGORY_ID, [
  createType('insurancePolicy', 'Insurance Policy'),
  createType('lostPayeeEvidence', 'Loss Payee Evidence'),
  createType('paymentConfirmation', 'Payment Confirmation'),
  createType('billOfExchange', 'Bill of Exchange'),
  createType('promissoryNote', 'Promissory Note')
])

module.exports = {
  async up(db) {
    for (const type of types) {
      await db.collection(COLLECTION_NAME_TYPES).insertOne(type)
    }
    await db.collection(COLLECTION_NAME_TYPES).updateOne({ _id: 'mrpa' }, { $set: { name: 'Legal Agreement' } })
    await db
      .collection(COLLECTION_NAME_TYPES)
      .updateOne({ _id: 'mrpaAppendix' }, { $set: { name: 'Legal Agreement Appendixes' } })
  },

  async down(db) {
    for (const type of types) {
      await db.collection(COLLECTION_NAME_TYPES).remove({ id: type.id })
    }
    await db.collection(COLLECTION_NAME_TYPES).updateOne({ _id: 'mrpa' }, { $set: { name: 'Discounting Agreement' } })
    await db
      .collection(COLLECTION_NAME_TYPES)
      .updateOne({ _id: 'mrpaAppendix' }, { $set: { name: 'Discounting Agreement Appendixes' } })
  }
}
