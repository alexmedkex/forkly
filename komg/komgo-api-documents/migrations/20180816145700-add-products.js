'use strict';

// TODO: Provide a correct list of predefined products
const products = [
  {
    _id: 'kyc',
    name: 'KYC',
    __v: 0
  },
  {
    _id: 'tradeFinance',
    name: 'TRADE FINANCE',
    __v: 0
  }
]

module.exports = {

  up(db, next) {
    for (const product of products) {
      db.collection('products').insert(product, next)
    }
  },

  down(db, next) {
    for (const product of products) {
      db.collection('products').remove({id: product.id}, next)
    }
  }

};
