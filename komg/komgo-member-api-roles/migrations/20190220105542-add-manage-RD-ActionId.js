'use strict';

module.exports = {
  up(db) {
    return db
      .collection('roles')
      .updateOne(
        { 'id': 'tradeFinanceOfficer' },
        {
          $push: {
            permittedActions: {
              'product': {
                'id': 'tradeFinance',
                'label': 'tradeFinance'
              },
              'action': {
                'id': 'manageRD',
                'label': 'manageRD'
              },
              'permission': {
                'id': 'crud',
                'label': 'crud'
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
        { 'id': 'tradeFinanceOfficer' },
        { $pull: { permittedActions: { 'action.id': 'manageRD' } } }
      )
  }
};
