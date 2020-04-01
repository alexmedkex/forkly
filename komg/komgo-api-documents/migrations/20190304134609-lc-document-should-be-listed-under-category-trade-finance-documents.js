'use strict';

module.exports = {

  async up(db) {
    return db.collection('documents').updateMany(
      { categoryId: 'trade-documents', typeId: 'lc' },
      { $set: { 'categoryId': 'trade-finance-documents' }}
    )
  },

  async down(db) {
    return db.collection('documents').updateMany(
      { categoryId: 'trade-finance-documents', typeId: 'lc' },
      { $set: { 'categoryId': 'trade-documents' }}
    )
  }
};