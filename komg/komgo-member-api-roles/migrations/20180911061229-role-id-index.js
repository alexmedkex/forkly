module.exports = {

  up(db) {
    return db.collection('roles').createIndex({ id: 1 })
  },

  down(db) {
    return db.collection('roles').dropIndex('id_1')
  }

}