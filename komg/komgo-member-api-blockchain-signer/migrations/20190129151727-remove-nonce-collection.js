module.exports = {
  async up(db) {
    await db.collection('nonces', { strict: true }, function(err, collection) {
      if (err) {
        console.log('nonces collection does not exist. Skipping migrations')
        return
      }

      return collection.drop()
    })
  },

  down(db) {
    // MongoDB creates collection on the fly so no need to recreate the collection on rollback
  }
}
