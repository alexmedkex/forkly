const OLD_COLLECTION_NAME = 'rfp-replies'
const NEW_COLLECTION_NAME = 'replies'
module.exports = {
  async up(db) {
    await renameCollectionIfExists(db, OLD_COLLECTION_NAME, NEW_COLLECTION_NAME)
  },

  async down(db) {
    await renameCollectionIfExists(db, NEW_COLLECTION_NAME, OLD_COLLECTION_NAME)
  }
}

async function renameCollectionIfExists(db, existingCollectionName, newCollectionName) {
  const existingCollection = (await db.listCollections().toArray()).find(collection => {
    return collection.name === existingCollectionName
  })
  if (existingCollection) {
    await db.collection(existingCollectionName).rename(newCollectionName)
    console.log(`Collection ${existingCollectionName} renamed to ${newCollectionName}}`)
  } else {
    console.log(`Collection ${existingCollectionName} has already been renamed to ${newCollectionName}}`)
  }
}
