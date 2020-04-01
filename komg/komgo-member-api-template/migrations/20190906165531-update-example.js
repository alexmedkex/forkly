'use strict'

const BINDINGS_COLLECTION = 'templatebindings'

const staticId = '99e6609d-99e4-4b89-b149-b5ecdc020c3a' // from 20190726150336-add-sblc-template-bindings.js

const exampleData = require('./data/examples/exampleData-v2')

module.exports = {
  up(db, next) {
    return db
        .collection(BINDINGS_COLLECTION)
        .remove({ staticId })
        .then(() => {
          const templateBinding = {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            staticId,
            version: 1,
            dataSchemaId: 'http://komgo.io/schema/data-letter-of-credit/1/base',
            templateSchemaId: 'http://komgo.io/schema/sblc/template-bindings/1',
            productId: 'TRADE_FINANCE',
            subProductId: 'LETTER_OF_CREDIT',
            bindings: {
              trade: 'http://komgo.io/schema/trade/2',
              cargo: 'http://komgo.io/schema/cargo/2',
              beneficiary: 'http://komgo.io/schema/company/1/base',
              applicant: 'http://komgo.io/schema/company/1/base',
              issuingBank: 'http://komgo.io/schema/company/1/base',
              beneficiaryBank: 'http://komgo.io/schema/company/1/base'
            },
            example: exampleData
          }

          return db.collection(BINDINGS_COLLECTION).insert(templateBinding, next)
        })
  },

  down(db, next) {
    return db
        .collection(BINDINGS_COLLECTION)
        .remove({ staticId })
        .then(() => {
          const templateBinding = {
            staticId,
            version: 1,
            dataSchemaId: 'http://komgo.io/schema/data-letter-of-credit/1/base',
            templateSchemaId: 'http://komgo.io/schema/sblc/template-bindings/1',
            productId: 'TRADE_FINANCE',
            subProductId: 'LETTER_OF_CREDIT',
            bindings: {
              trade: 'http://komgo.io/schema/trade/2',
              cargo: 'http://komgo.io/schema/cargo/2',
              beneficiary: 'http://komgo.io/schema/company/1/base',
              applicant: 'http://komgo.io/schema/company/1/base',
              issuingBank: 'http://komgo.io/schema/company/1/base',
              beneficiaryBank: 'http://komgo.io/schema/company/1/base'
            },
            example: exampleData
          }

          return db.collection(BINDINGS_COLLECTION).insert(templateBinding, next)
        })
  }
}
