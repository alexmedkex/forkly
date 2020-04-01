'use strict';

const categories = [
  {
    _id: 'company-details',
    productId: 'kyc',
    name: 'Company Details',
    __v: 0
  },
  {
    _id: 'management-and-directors',
    productId: 'kyc',
    name: 'Management and directors',
    __v: 0
  },
  {
    _id: 'shareholders',
    productId: 'kyc',
    name: 'Shareholders - Ultimate Beneficiary Owners (UBOs)',
    __v: 0
  },
  {
    _id: 'business-description',
    productId: 'kyc',
    name: 'Business description',
    __v: 0
  },
  {
    _id: 'regulation-and-compliance',
    productId: 'kyc',
    name: 'Regulation/Compliance',
    __v: 0
  },
  {
    _id: 'banking-documents',
    productId: 'kyc',
    name: 'Banking documents',
    __v: 0
  },
  {
    _id: 'miscellaneous',
    productId: 'kyc',
    name: 'Miscellaneous',
    __v: 0
  },
  {
    _id: 'trade-documents',
    productId: 'tradeFinance',
    name: 'Trade Documents',
    __v: 0
  },
  {
    _id: 'trade-finance-documents',
    productId: 'tradeFinance',
    name: 'Trade Finance Documents',
    __v: 0
  },
  {
    _id: 'commercial-documents',
    productId: 'tradeFinance',
    name: 'Commercial Documents',
    __v: 0
  }
]

module.exports = {

  async up(db) {
    await verifyHasAllProductIds(db)
    for (const category of categories) {
      await db.collection('categories').insert(category)
    }
  },

  async down(db) {
    for (const category of categories) {
      await db.collection('categories').remove({_id: category.id})
    }
  }

};

async function verifyHasAllProductIds(db) {
  const productIds = {}
  for (const category of categories) {
    productIds[category.productId] = true
  }

  for (const productId in productIds) {
    const product = await db.collection('products').findOne({ _id: productId })
    if (!product) {
      throw new Error(`Product with id ${productId} was not found`)
    }
  }
}
