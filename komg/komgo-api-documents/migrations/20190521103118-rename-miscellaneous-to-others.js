'use strict';

module.exports = {

  async up(db) {
    await db.collection("categories").deleteOne({ _id: "miscellaneous" }, function(err, content) {
      if (err)
        console.log('Error renaming category `miscellaneous` to `others`')
      else
        db.collection("categories").insertOne({_id:"others", productId: "kyc", name: "Others", __v : 0})
    })
    // Modify the associated document types to the new category id: `others`
    return await db.collection('types').updateOne({_id: 'n-a'}, {$set: {categoryId: 'others'}})
  },

  async down(db) {
    await db.collection("categories").deleteOne({ _id: "others" }, function(err, user) {
      if (err)
        console.log('Error renaming category `others` to `miscellaneous`')
      else
        db.collection("categories").insertOne({_id:"miscellaneous", productId: "kyc", name: "Miscellaneous", __v : 0})
    })
    // Modify the associated document types to the old category id: `miscellaneous`
    return await db.collection('types').updateOne({_id: 'n-a'}, {$set: {categoryId: 'miscellaneous'}})
  }

};