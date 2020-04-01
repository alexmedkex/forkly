'use strict'

module.exports = {

  up(db) {
    // manageAppetite
    db
      .collection('roles')
      .updateOne(
        { 'id': 'relationshipManager' },
        {
          $push: {
            permittedActions: {
              'product': {
                'id': 'tradeFinance',
                'label': 'tradeFinance'
              },
              'action': {
                'id': 'manageAppetite',
                'label': 'manageAppetite'
              },
              'permission': {
                'id': 'crud',
                'label': 'crud'
              }
            }
          }
        }
      )
    db
      .collection('roles')
      .updateOne(
        { 'id': 'middleAndBackOfficer' },
        {
          $push: {
            permittedActions: {
              'product': {
                'id': 'tradeFinance',
                'label': 'tradeFinance'
              },
              'action': {
                'id': 'manageAppetite',
                'label': 'manageAppetite'
              },
              'permission': {
                'id': 'read',
                'label': 'read'
              }
            }
          }
        }
      )
    // manageRDRequest
    db
      .collection('roles')
      .updateOne(
        { 'id': 'relationshipManager' },
        {
          $push: {
            permittedActions: {
              'product': {
                'id': 'tradeFinance',
                'label': 'tradeFinance'
              },
              'action': {
                'id': 'manageRDRequest',
                'label': 'manageRDRequest'
              },
              'permission': {
                'id': 'crud',
                'label': 'crud'
              }
            }
          }
        }
      )
    db
      .collection('roles')
      .updateOne(
        { 'id': 'middleAndBackOfficer' },
        {
          $push: {
            permittedActions: {
              'product': {
                'id': 'tradeFinance',
                'label': 'tradeFinance'
              },
              'action': {
                'id': 'manageRDRequest',
                'label': 'manageRDRequest'
              },
              'permission': {
                'id': 'read',
                'label': 'read'
              }
            }
          }
        }
      )
  },

  down(db) {
    db
      .collection('roles')
      .updateOne(
        { 'id': 'relationshipManager' },
        { $pull: { permittedActions: { 'action.id': 'manageAppetite' } } }
      )
    db
      .collection('roles')
      .updateOne(
        { 'id': 'middleAndBackOfficer' },
        { $pull: { permittedActions: { 'action.id': 'manageAppetite' } } }
      )
    db
      .collection('roles')
      .updateOne(
        { 'id': 'relationshipManager' },
        { $pull: { permittedActions: { 'action.id': 'manageRDRequest' } } }
      )
    db
      .collection('roles')
      .updateOne(
        { 'id': 'middleAndBackOfficer' },
        { $pull: { permittedActions: { 'action.id': 'manageRDRequest' } } }
      )
  }
}
