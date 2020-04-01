'use strict';

const miscellaneousType = {
  "_id" : "n-a",
  "productId" : "kyc",
  "categoryId" : "miscellaneous",
  "name" : "N/A",
  "fields" : []
}

module.exports = {

  async up(db) {
    await db.collection('types').insert(miscellaneousType)
  },

  async down(db) {
    await db.collection('types').deleteOne({_id: miscellaneousType._id})
  }

};