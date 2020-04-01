'use strict'

var createTradeFinanceType = require('../src/migration-utils').createTradeFinanceType
var newCommercialContractDocumentTypes = require('../src/migration-utils').newCommercialContractDocumentTypes

const COLLECTION_NAME = 'types'

const newTypes = newCommercialContractDocumentTypes([
  createTradeFinanceType(
    'commercialContractAmendment',
    'COMMERCIAL_CONTRACT_AMENDMENT',
    'Commercial Contract Amendment'
  )
])

module.exports = {
  async up(db) {
    for (const type of newTypes) {
      await db.collection(COLLECTION_NAME).insert(type)
    }
  },

  async down(db) {
    for (const type of newTypes) {
      await db.collection(COLLECTION_NAME).remove({ id: type.id })
    }
  }
}
