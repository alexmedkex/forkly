'use strict';

const TEMPLATE_COLLECTION = 'templates'
const BINDINGS_COLLECTION = 'templatebindings'

const templateStaticId = 'fc7c042a-7034-4fc0-b4ad-651816f727440'
const bindingStaticId = '99e6609d-99e4-4b89-b149-b5ecdc020c3a' // from 20190726150336-add-sblc-template-bindings.js

const templateData = require('./data/slateTemplates/SBLC_EQUINOR_OIL_PRODUCTS.json')

const EquinorStaticId = '43719562-941f-40ca-927f-4fb879837be8'

module.exports = {
  async up(db, next) {
    const template = {
      version: 1,
      name: "STANDARD DRAFT SBLC PROVIDED BY EQUINOR - OIL PRODUCTS",
      ownerCompanyStaticId: EquinorStaticId,
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