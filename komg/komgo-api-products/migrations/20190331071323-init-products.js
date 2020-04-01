'use strict'

const products = [
  {
    productName: 'KYC',
    productId: 'KYC'
  },
  {
    productName: 'Letter Of Credit',
    productId: 'LC'
  },
  {
    productName: 'Receivables Discounting',
    productId: 'RD'
  }
]

module.exports = {
  up(db) {
    return db
      .collection('products')
      .remove()
      .then(() => db.collection('products').insertMany(products))
  },

  down(db, next) {
    next()
  }
}
