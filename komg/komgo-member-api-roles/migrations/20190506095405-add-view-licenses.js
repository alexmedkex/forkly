'use strict';

module.exports = {
  up(db) {
    return db
      .collection('roles')
      .updateOne(
        { 'id': 'relationshipManager' },
        {
          $push: {
            permittedActions: {
              'product': {
                'id': 'administration',
                'label': 'Administration'
              },
              'action': {
                'id': 'viewLicenses',
                'label': 'View Licenses'
              }
            }
          }
        }
      )
  },

  down(db) {
    return db
      .collection('roles')
      .updateOne(
        { 'id': 'relationshipManager' },
        { $pull: { permittedActions: { 'action.id': 'viewLicenses' } } }
      )
  }

};
