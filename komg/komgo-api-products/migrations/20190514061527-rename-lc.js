'use strict'

module.exports = {
  up(db) {
    return db.collection('products').updateOne({ productId: 'LC' }, { $set: { productName: 'LC / SBLC' } })
  },

  down(db, next) {
    next()
  }
}
