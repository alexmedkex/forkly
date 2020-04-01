module.exports = {
  async up(db) {
    await db.collection('transactions', { strict: true }, (err, collection) => {
      if (err) {
        console.log('transactions collection does not exist. Skipping migrations')
        return
      }

      return collection.updateMany({}, { $set: { attempts: 0 } })
    })
  },

  async down(db) {
    await db.collection('transactions', { strict: true }, (err, collection) => {
      if (err) {
        console.log('transactions collection does not exist. Skipping migrations')
        return
      }

      return collection.updateMany({}, { $unset: { attempts: '' } })
    })
  }
}
