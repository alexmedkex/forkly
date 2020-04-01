'use strict'

const BINDINGS_COLLECTION = 'templatebindings'

const staticId = '99e6609d-99e4-4b89-b149-b5ecdc020c3a' // generate one

const exampleData = require('./data/examples/exampleData-v1')

// the original one which is missing issuingBankReference - fixed in another migration
const extendedStandbyLetterOfCreditExample = {
  "staticId": "1cf0b888-e5ff-47ca-bcf2-b2dc9478b81c",
  "status": "REQUESTED",
  "reference": "REF-0000-00",
  "issuingBankComment": "'Cool SBLC!",
  "issuingBankPostalAddress": "99-97 a street London EC1 000",
}

module.exports = {
  up(db, next) {

    const templateBinding = {
      staticId,
      version: 1,
      dataSchemaId: "http://komgo.io/schema/sblc/template-bindings/1",
      productId: "TRADE_FINANCE",
      subProductId: "LETTER_OF_CREDIT",
      bindings: {
        trade: "http://komgo.io/schema/trade/2",
        cargo: "http://komgo.io/schema/cargo/2",
        beneficiary: "http://komgo.io/schema/company/1/base",
        applicant: "http://komgo.io/schema/company/1/base",
        issuingBank: "http://komgo.io/schema/company/1/base",
        beneficiaryBank: "http://komgo.io/schema/company/1/base",
        standbyLetterOfCredit: "http://komgo.io/schema/sblc/1/base",
        extendedStandbyLetterOfCredit: "http://komgo.io/schema/sblc/1/extended"
      },
      example: {
        ...exampleData,
        extendedStandbyLetterOfCredit: extendedStandbyLetterOfCreditExample
      }
    }

    return db.collection(BINDINGS_COLLECTION).insert(templateBinding, next)
  },

  down(db, next) {
    db.collection(BINDINGS_COLLECTION).remove({ staticId }, next)
  }
}