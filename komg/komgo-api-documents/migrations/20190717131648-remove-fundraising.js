'use strict';

const categoryIdToRemove = 'fundraising'
const categoryIdToMoveDocs = 'additional'
const typeIdToMoveDocs = 'other-additional'
const categoryToRemove = {
    "_id" : "fundraising",
    "productId" : "kyc",
    "name" : "Fundraising",
    "_v" : 0
  }
const typesToRemove = [ // This is used just for reverting purposes 
  {
    "_id" : "administrative-documents",
    "productId" : "kyc",
    "categoryId" : "fundraising",
    "name" : "Administrative documents",
    "fields" : [],
    "__v" : 0,
    "predefined" : true
  },
  {
    "_id" : "company-presentation-elements",
    "productId" : "kyc",
    "categoryId" : "fundraising",
    "name" : "Company presentation elements",
    "fields" : [],
    "__v" : 0,
    "predefined" : true
  },
  {
    "_id" : "contracts",
    "productId" : "kyc",
    "categoryId" : "fundraising",
    "name" : "Contracts",
    "fields" : [],
    "__v" : 0,
    "predefined" : true
  },
  {
    "_id" : "financials",
    "productId" : "kyc",
    "categoryId" : "fundraising",
    "name" : "Financials",
    "fields" : [],
    "__v" : 0,
    "predefined" : true
  },
  {
    "_id" : "human-resources-social",
    "productId" : "kyc",
    "categoryId" : "fundraising",
    "name" : "Human resources & social",
    "fields" : [],
    "__v" : 0,
    "predefined" : true
  },
  {
    "_id" : "legal-insurance-intellectual-property",
    "productId" : "kyc",
    "categoryId" : "fundraising",
    "name" : "Legal, insurance & intellectual property",
    "fields" : [],
    "__v" : 0,
    "predefined" : true
  },
  {
    "_id" : "taxes",
    "productId" : "kyc",
    "categoryId" : "fundraising",
    "name" : "Taxes",
    "fields" : [],
    "__v" : 0,
    "predefined" : true
  }
]

module.exports = {

  async up(db) {
    await db.collection('categories').deleteOne({ _id: categoryIdToRemove })
    // Remove all the types associated with the category to remove
    await db.collection('types').deleteMany({ categoryId: categoryIdToRemove })
    // Move all the documents under the category removed to category 'Additional' and type 'Other'
    await db.collection('documents').updateMany({categoryId:categoryIdToRemove}, {$set: { 'categoryId': categoryIdToMoveDocs , 'typeId' : typeIdToMoveDocs }})
  },

  async down(db) {
    // Revert the removal of the category 'Fundraising'
    await db.collection('categories').insertOne(categoryToRemove)
    // Revert the removal types under the category 'Fundraising'
    await db.collection('types').insertMany(typesToRemove)
  }

};