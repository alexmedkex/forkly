'use strict';

const TEMPLATE_COLLECTION = 'templates'

const komgoTemplate = require('./data/slateTemplates/komgoTemplate-v1.json')

const staticId = 'e173db22-e297-4f71-9f1d-b1bb59e7124a' // generate one

module.exports = {

  up(db, next) {

    const template = {
      version: 1,
      name: "Komgo Standby Letter of Credit template",
      ownerCompanyStaticId: 'komgo',
      templateBindingStaticId: '99e6609d-99e4-4b89-b149-b5ecdc020c3a', // from 20190726150336-add-sblc-template-bindings.js
      productId: 'TRADE_FINANCE',
      subProductId: 'LETTER_OF_CREDIT',
      commodity: '',
      revision: 0,
      template: komgoTemplate,
      staticId

    }

    return db.collection(TEMPLATE_COLLECTION).insert(template, next)
  },

  down(db, next) {
    db.collection(TEMPLATE_COLLECTION).remove({ staticId }, next)
  }
};