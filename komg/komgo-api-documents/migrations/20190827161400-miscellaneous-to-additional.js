module.exports = {
    async up(db) {
      await db.collection('documents', { strict: true }, (err, collection) => {
        if (err) {
          console.log('documents collection does not exist. Skipping migrations')
          return
        }
  
        return collection.updateMany({ categoryId: 'miscellaneous' }, { $set: { categoryId: 'additional' } })
      })
    },
  
    async down(db) {
      await db.collection('documents', { strict: true }, (err, collection) => {
        if (err) {
          console.log('documents collection does not exist. Skipping migrations')
          return
        }
  
        return collection.updateMany({ categoryId: 'additional' }, { $set: { categoryId: 'others' } })
      })
    }
  }
  