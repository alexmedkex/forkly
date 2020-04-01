const dropIndexesIfPresent = async (db, collectionName, indexNamesToDrop) => {
  const indexes = await db.collection(collectionName).indexes()
  for (let index of indexes) {
    console.log(index)
    if (indexNamesToDrop.includes(index.name)) {
      console.log(`found ${index.name} - dropping index`)
      await db.collection(collectionName).dropIndex(index.name)
    }
  }
}

module.exports = { dropIndexesIfPresent }
