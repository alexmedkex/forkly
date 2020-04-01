'use strict';

const TEMPLATE_COLLECTION = 'templates'

const staticId = 'e173db22-e297-4f71-9f1d-b1bb59e7124a' // from 20190731132630-add-komgo-sblc-template.js

const komgoTemplateV3 = require('./data/slateTemplates/komgoTemplate-v3.json')
const { SubProduct } = require('@komgo/types')
module.exports = {
  up(db, next) {
    return db
      .collection(TEMPLATE_COLLECTION)
      .remove({ staticId })
      .then(() => {
        const template = {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'Komgo',
          updatedBy: 'Komgo',
          version: 2,
          name: 'Komgo Standby Letter of Credit template',
          ownerCompanyStaticId: 'komgo',
          templateBindingStaticId: '99e6609d-99e4-4b89-b149-b5ecdc020c3a', // from 20190726150336-add-sblc-template-bindings.js
          productId: 'TRADE_FINANCE',
          subProductId: SubProduct.LetterOfCredit,
          commodity: '',
          revision: 2,
          template: komgoTemplateV3,
          staticId
        }

        return db.collection(TEMPLATE_COLLECTION).insert(template, next)
      })
      .catch(e => console.log('Migration failed', e))
  },

  down(db, next) {
    return db
      .collection(TEMPLATE_COLLECTION)
      .remove({ staticId })
      .then(() => {
        const template = {
          version: 1,
          name: 'Komgo Standby Letter of Credit template',
          ownerCompanyStaticId: 'komgo',
          templateBindingStaticId: '99e6609d-99e4-4b89-b149-b5ecdc020c3a', // from 20190726150336-add-sblc-template-bindings.js
          productId: 'TRADE_FINANCE',
          subProductId: 'LETTER_OF_CREDIT',
          commodity: '',
          revision: 2,
          template: komgoTemplateV3,
          staticId
        }
        // re-add old one
        return db.collection(TEMPLATE_COLLECTION).insert(template, next)
      })
        .catch(e => console.log('Migration failed', e))
  }
}
