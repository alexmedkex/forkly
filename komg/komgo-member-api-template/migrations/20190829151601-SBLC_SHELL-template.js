'use strict';

const TEMPLATE_COLLECTION = 'templates'
const BINDINGS_COLLECTION = 'templatebindings'

const templateStaticId = '6e6f84dd-3ea0-443a-981c-620cd2e013d1'
const bindingStaticId = '99e6609d-99e4-4b89-b149-b5ecdc020c3a' // from 20190726150336-add-sblc-template-bindings.js

const templateData = require('./data/slateTemplates/SBLC_SHELL.json')

const ShellStaticId = 'a2b5361d-53d3-4d78-9f1c-9e465742ca50'

module.exports = {
  async up(db, next) {
    const template = {
      version: 1,
      name: "STANDARD DRAFT SBLC PROVIDED BY SHELL",
      ownerCompanyStaticId: ShellStaticId,
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