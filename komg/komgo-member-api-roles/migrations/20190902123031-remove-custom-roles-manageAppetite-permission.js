'use strict'

module.exports = {
  async up(db) {
    await db
      .collection('roles')
      .updateMany(
        { 'permittedActions.action.id': 'manageAppetite' },
        { $pull: { permittedActions: { 'action.id': 'manageAppetite' } } }
      )
  },

  async down(db) {}
}
