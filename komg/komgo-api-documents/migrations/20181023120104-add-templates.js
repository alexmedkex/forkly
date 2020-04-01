'use strict';


const templates = [{
  _id: 'demo-template',
  name: 'Demo template',
  productId: 'kyc',
  types: [
    'certificate-of-incorporation',
    'proof-of-registration',
    'list-of-directors',
    'aml-letter'
  ],
  metadata: []
}]

module.exports = {

  async up(db, next) {
    for (const template of templates) {
      await db.collection('templates').insert(template, next)
    }
  },

  async down(db, next) {
    for (const template of templates) {
      await db.collection('templates').remove(template, next)
    }
  }

};
