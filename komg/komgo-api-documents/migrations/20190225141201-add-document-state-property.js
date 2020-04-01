module.exports = {
    async up(db) {
      await db.collection('documents', { strict: true }, (err, collection) => {
        if (err) {
          console.log('documents collection does not exist. Skipping migrations')
          return
        }
  
        return collection.updateMany({ state: { $exists: false } }, { $set: { state: 'REGISTERED' } })
      })
    },
  
    async down(db) {
      await db.collection('documents', { strict: true }, (err, collection) => {
        if (err) {
          console.log('documents collection does not exist. Skipping migrations')
          return
        }
  
        return collection.updateMany({}, { $unset: { state: '' } })
      })
    }
  }
  