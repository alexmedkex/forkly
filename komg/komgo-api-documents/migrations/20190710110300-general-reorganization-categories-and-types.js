'use strict';

/**
 * This is the object holding all the modifications for the categories.
 * It contains as key the old id of the category to modify and as
 * a value has an object of arrays. In the first element is the
 * old name/id and in the second one the new one.
 */
const renamedCategories = {
  'shareholders': {
    name: ["Shareholders - Ultimate Beneficiary Owners (UBOs)", "Shareholders - Ultimate Beneficial Owners (UBOs)"],
    id: ["shareholders", "shareholders"]
  },
  'others': {
    name: ["Others", "Additional"],
    id: ["others", "additional"]
  },
  'regulation-and-compliance': {
    name: ["Regulation/Compliance", "Regulation / Compliance"],
    id: ["regulation-and-compliance", "regulation-and-compliance"]
  }
}

/**
 * It contains the modifications for the types. The key is the OLD id for the
 * category where the modified type falls (BEWARE this id could have been modified by
 * the previous migration). The value is an array with modifications for those
 * types affected 
 */
const renamedTypes = {
  'banking-documents': [
    {
      name: ["General assignment", "Assignment"],
      id: ["general-assignment", "assignment"]
    },
    {
      name: ["GTCs", "GT&Cs"],
      id: ["gtcs", "gt&cs"]
    }
  ],
  'business-description': [
    {
      name: ["Company profile signed", "Company profile"],
      id: ["company-profile-signed", "company-profile"]
    },
    {
      name: ["Latest audited financials", "Financials"],
      id: ["latest-audited-financials", "business-description-financials"]
    }
  ],
  'company-details': [
    {
      name: ["Article of association", "Articles of association"],
      id: ["article-of-association", "articles-of-association"]
    },
    {
      name: ["Memorandum of articles", "Memorandum of association"],
      id: ["memorandum-of-articles", "memorandum-of-association"]
    },
    {
      name: ["Proof of registration", "Proof of registration / extract of commercial register"],
      id: ["proof-of-registration", "proof-of-registration"]
    },
    {
      name: ["Third party reference", "Reference letter"],
      id: ["third-party-reference", "reference-letter"]
    }
  ],
  'management-and-directors': [
    {
      name: ["Passports of the directors", "Passport of the directors"],
      id: ["passports-of-directors", "passport-of-directors"]
    },
    {
      name: ["Resumes", "Resume"],
      id: ["management-and-directors-resume", "management-and-directors-resume"]
    }
  ],
  'shareholders': [
    {
      name: ["Passports of UBOs", "Passport of UBOs"],
      id: ["passports-of-ubos", "passport-of-ubos"]
    },
    {
      name: ["Proof of existence of Direct Parent Company", "Direct parent company document"],
      id: ["direct-parent-company-proof-of-existance", "direct-parent-company-document"]
    },
    {
      name: ["Resumes", "Resume"],
      id: ["shareholders-resume", "shareholders-resume"]
    },
    {
      name: ["Shareholder chart signed including UBOs", "Shareholding structure"],
      id: ["shareholder-chard-signed-including-ubos", "shareholding-structure"]
    }
  ],
  'additional': [
    {
      name: ["N/A", "Other"],
      id: ["n-a", "other-additional"]
    }
  ]
}

/**
 * This object contains the list of types to be removed. The key is the OLD
 * id of the category for that type and the value is an array with the ids of
 * the types that need to be removed
 */
const removedTypes = {
  'business-description': ['products-traded'],
  'management-and-directors': ['complete-management-identification', 
    'latest-board-of-directors-on-the-appointment-of-directors',
  ],
  'regulation-and-compliance': ['bank-fiduciary-mandate']
}

/**
 * This object contains the new types added under each category. In the key
 * we store the OLD id of the category and the value is a list of objects
 * with the new id and name for those new types
 */
const addedTypes = {
  'banking-documents': [
    {
      name: "Account opening form",
      id: "account-opening-form"
    },
    {
      name: "Facility agreement",
      id: "facility-agreement"
    },
    {
      name: "Guarantees",
      id: "guarantees"
    },
    {
      name: "Other",
      id: "other-banking-documents"
    }
  ],
  'business-description': [
    {
      name: "Other",
      id: "other-business-description"
    }
  ],
  'company-details': [
    {
      name: "Bank details",
      id: "bank-details"
    },
    {
      name: "Certificate of good standing",
      id: "certificate-of-good-standing"
    },
    {
      name: "Onboarding questionnaire",
      id: "onboarding-questionnaire"
    },
    {
      name: "Other",
      id: "other-company-details"
    }
  ],
  'management-and-directors': [
    {
      name: 'List of senior management',
      id: 'list-of-senior-management'
    },
    {
      name: 'Passport of the managers',
      id: 'passport-of-the-managers'
    },
    {
      name: "Other",
      id: "other-management-and-directors"
    }
  ],
  'regulation-and-compliance': [
    {
      name: "Other",
      id: "other-regulation-and-compliance"
    }
  ],
  'shareholders': [
    {
      name: "Other",
      id: "other-shareholders"
    }
  ]
}

const OLD=0
const NEW=1

module.exports = {

  async up(db) {
    // 1 - Remove document types
    await migrateRemoveTypes(db)
    // 2 - Add new document types
    await migrateAddTypes(db)
    // 3 - Rename document types
    await migrateRenameTypes(db)
    // 4 - Rename categories
    await migrateRenameCategories(db)
  },

  async down(db) {
    // 1 - Revert rename categories
    await revertRenameCategories(db)
    // 2 - Revert rename document types
    await revertRenameTypes(db)
    // 3 - Revert add new document types
    await revertAddTypes(db)
    // 4 - Revert remove document types
    await revertRemoveTypes(db)
  },

};

async function revertRemoveTypes(db){
  for(const entry of Object.entries(removedTypes)){
    const category = entry[0]
    const typesToRemove = entry[1]
    // Remove the affected types from the types collection
    for(const typeId of typesToRemove) {
      await db.collection('types').insertOne({_id: typeId, 'categoryId': category,
      'productId': 'kyc', 'name': '', 'fields':[], '__v': 0, 'predefined': true})
    }
  }
}

async function revertAddTypes(db){
  for(const entry of Object.entries(addedTypes)){
    const category = entry[0]
    const typesToAdd = entry[1]
    for(const type of typesToAdd) {
      db.collection('types').deleteOne( { '_id': type.id} )
    }
  }
}

async function revertRenameTypes(db){
  for(const entry of Object.entries(renamedTypes)) {
    const category = entry[0]
    const typesToRename = entry[1]
    for(const rename of typesToRename ){
      let newType = await db.collection('types').findOne({_id: rename.id[NEW]})
      newType._id = rename.id[OLD]
      newType.name = rename.name[OLD]
      await db.collection('types').deleteOne({ _id: rename.id[NEW] })
      await db.collection('types').insertOne(newType)
          /* After renaming the types, we have to update also the documents that had those types assigned */
      await db.collection('documents').updateMany({categoryId:category, typeId: rename.id[NEW]},
          {$set: { 'typeId' : rename.id[OLD] }})
        }
    }
}

async function revertRenameCategories(db){
  for(const entry of Object.entries(renamedCategories)) {
    const rename = entry[1]
    await db.collection('categories').deleteOne({ _id: rename.id[NEW] })
    await db.collection('categories').insertOne( {_id: rename.id[OLD], productId: 'kyc', name: rename.name[OLD],
     __v: 0})
     //Update types that are associated with renamed categories
    await db.collection('types').updateMany({categoryId:rename.id[NEW]},
      {$set: { 'categoryId' : rename.id[OLD] }})
     //Update the documents associated with the renamed categories
     await db.collection('documents').updateMany({categoryId:rename.id[NEW]},
      {$set: { 'categoryId' : rename.id[OLD] }})
  }
}

async function migrateRenameCategories(db){
  for(const entry of Object.entries(renamedCategories)) {
    const category = entry[0]
    const rename = entry[1]
    await db.collection('categories').deleteOne({ _id: rename.id[OLD] })
    await db.collection('categories').insertOne( {_id: rename.id[NEW], productId: 'kyc', name: rename.name[NEW],
     __v: 0})
     //Update types that are associated with renamed categories
    await db.collection('types').updateMany({categoryId:category},
      {$set: { 'categoryId' : rename.id[NEW] }})
     //Update the documents associated with the renamed categories
     await db.collection('documents').updateMany({categoryId:category},
      {$set: { 'categoryId' : rename.id[NEW] }})
  }
}

async function migrateRemoveTypes(db){
  for(const entry of Object.entries(removedTypes)){
    const category = entry[0]
    const typesToRemove = entry[1]
    // Remove the affected types from the types collection
    for(const typeId of typesToRemove) {
      await db.collection('types').deleteOne({_id: typeId})
    }
    /* Move all the documents under the affected types to 'Others' category
    and 'N/A' document type */
    await db.collection('documents').updateMany({categoryId:category, typeId: { $in:typesToRemove}},
      {$set: { 'categoryId': 'others' , 'typeId' : 'n-a' }})
  }
}

async function migrateAddTypes(db){
  for(const entry of Object.entries(addedTypes)){
    const category = entry[0]
    const typesToAdd = entry[1]
    for(const type of typesToAdd) {
      db.collection('types').insertOne( { '_id': type.id, 'productId': 'kyc', 'categoryId': category, 
        'name': type.name, 'fields': [], '__v': 0, 'predefined': true } )
    }
  }
}

async function migrateRenameTypes(db){
  for(const entry of Object.entries(renamedTypes)) {
    const category = entry[0]
    const typesToRename = entry[1]
    for(const rename of typesToRename ){
      let oldType = await db.collection('types').findOne({_id: rename.id[OLD]})
      oldType._id = rename.id[NEW]
      oldType.name = rename.name[NEW]
      await db.collection('types').deleteOne({ _id: rename.id[OLD] })
      await db.collection('types').insertOne(oldType)
          /* After renaming the types, we have to update also the documents that had those types assigned */
      await db.collection('documents').updateMany({categoryId:category, typeId: rename.id[OLD]},
          {$set: { 'typeId' : rename.id[NEW] }})
        }
    }
}
