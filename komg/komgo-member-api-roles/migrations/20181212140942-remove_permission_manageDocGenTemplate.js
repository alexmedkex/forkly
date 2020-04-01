'use strict'

module.exports = {
  up(db) {
    return db
      .collection('roles')
      .updateMany(
        { permittedActions: { $elemMatch: { 'action.id': 'manageDocGenTemplate' } } },
        { $pull: { permittedActions: { 'action.id': 'manageDocGenTemplate' } } }
      )
  },

  down(db, next) {
    next()
  }
}
