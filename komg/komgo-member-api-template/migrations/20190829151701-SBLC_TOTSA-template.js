'use strict';

const TEMPLATE_COLLECTION = 'templates'
const BINDINGS_COLLECTION = 'templatebindings'

const templateStaticId = 'e34096cf-4a5c-45a6-a455-8ae1365ee0dc'
const bindingStaticId = '99e6609d-99e4-4b89-b149-b5ecdc020c3a' // from 20190726150336-add-sblc-template-bindings.js

const templateData = require('./data/slateTemplates/SBLC_TOTSA.json')

const TOTSAStaticId = 'c6cabd5a-fae9-4f7d-aab8-bf4e22a769c6'

module.exports = {
  async up(db, next) {
    const template = {
      version: 1,
      name: "STANDARD DRAFT SBLC PROVIDED BY TOTSA",
      ownerCompanyStaticId: TOTSAStaticId,
      templateBindingStaticId: bindingStaticId,
      productId: 'TRADE_FINANCE',
      subProductId: 'LETTER_OF_CREDIT',
      commodity: '',
      revision: 1,
      template: templateData,
      origin: 'SYSTEM',
      staticId: templateStaticId,
      createdAt: new Date(),
      createdBy: 'Komgo',
      updatedAt: new Date(),
      updatedBy: 'Komgo'
    }

    await db.collection(TEMPLATE_COLLECTION).insert(template)

    next()
  },

  async down(db, next) {
    await db.collection(TEMPLATE_COLLECTION).remove({ staticId: templateStaticId })

    next()
  }
};
