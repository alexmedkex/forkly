'use strict';

var predef = require('../config/predefined-document-types');

module.exports = {

  async up(db) {
    await verifyHasAllProductIds(db, predef.types)
    for (const type of predef.types) {
      await db.collection('types').insert(type)
    }
    },

  async down(db) {
    for (const type of predef.types) {
      await db.collection('types').remove({id: type.id})
    }
  }
};

async function verifyHasAllProductIds(db, types) {
  const productIds = {}
  const categoryIds = {}
  for (const type of types) {
    productIds[type.productId] = true
    categoryIds[type.categoryId] = true
  }

  for (const productId in productIds) {
    const product = await db.collection('products').findOne({ _id: productId })
    if (!product) {
      throw new Error(`Product with id ${productId} was not found`)
    }
  }

  for (const categoryId in categoryIds) {
    const category = await db.collection('categories').findOne({ _id: categoryId })
    if (!category) {
      throw new Error(`Category with id ${categoryId} was not found`)
    }
  }
}
