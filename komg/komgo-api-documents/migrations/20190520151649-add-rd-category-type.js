'use strict'

var createTypes = require('../src/migration-utils').createTypes
var createType = require('../src/migration-utils').createType

const COLLECTION_NAME_TYPES = 'types'
const COLLECTION_NAME_CATEGORIES = 'categories'

const CATEGORY_ID = 'receivables-discounting-documents'
const PRODUCT_ID = 'tradeFinance'

const categories = [
  {
    _id: CATEGORY_ID,
    productId: PRODUCT_ID,
    name: 'Receivables Discounting Documents',
    __v: 0
  }
]

const types = createTypes(PRODUCT_ID, CATEGORY_ID, [
  createType('renunciationOfRights', 'Renunciation of Rights'),
  createType('paymentUndertaking', 'Payment Undertaking'),
  createType('assignmentOfProceeds', 'Assignment of Proceeds'),
  createType('parentCompanyGuarantee', 'Parent Company Guarantee'),
  createType('proofOfDiscounting', 'Proof of Discounting'),
  createType('mrpa', 'Discounting Agreement'),
  createType('mrpaAppendix', 'Discounting Agreement Appendixes'),
  createType('proofOfRepayment', 'Proof of Repayment')
])

module.exports = {
  async up(db) {
    for (const category of categories) {
      await db.collection(COLLECTION_NAME_CATEGORIES).insertOne(category)
    }
    for (const type of types) {
      await db.collection(COLLECTION_NAME_TYPES).insertOne(type)
    }
  },

  async down(db) {
    for (const category of categories) {
      await db.collection(COLLECTION_NAME_CATEGORIES).remove({ _id: category.id })
    }
    for (const type of types) {
      await db.collection(COLLECTION_NAME_TYPES).remove({ id: type.id })
    }
  }
}
