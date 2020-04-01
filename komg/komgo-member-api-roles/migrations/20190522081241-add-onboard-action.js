'use strict';

module.exports = {
  up(db) {
    return db
      .collection('roles')
      .updateOne(
        { 'id': 'komgoAdmin' },
        {
          $push: {
            permittedActions: {
              'product': {
                'id': 'administration',
                'label': 'Administration'
              },
              'action': {
                'id': 'onboard',
                'label': 'Onboard'
              },
              'permission': {
                'id': 'registerAndOnboardAnyMember',
                'label': 'RegisterAndOnboardAnyMember'
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
        { 'id': 'komgoAdmin' },
        { $pull: { permittedActions: { 'action.id': 'onboard' } } }
      )
  }
};