'use strict';

module.exports = {

  async up(db) {
    //manageRiskCover
    await db
      .collection('roles')
      .updateOne(
        { 'id': 'relationshipManager' },
        { $pull: { permittedActions: { 'action.id': 'manageAppetite' } } }
      )

    await db
      .collection('roles')
      .updateOne(
        { 'id': 'middleAndBackOfficer' },
        { $pull: { permittedActions: { 'action.id': 'manageAppetite' } } }
      )

    await db
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
                'id': 'manageRiskCover',
                'label': 'manageRiskCover'
              },
              'permission': {
                'id': 'crud',
                'label': 'crud'
              }
            }
          }
        }
      )
    await db
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
                'id': 'manageRiskCover',
                'label': 'manageRiskCover'
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

  async down(db) {
    await db
      .collection('roles')
      .updateOne(
        { 'id': 'relationshipManager' },
        {
          $pull: { permittedActions: { 'action.id': 'manageRiskCover' } }
        }
      )

    await db
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
    await db
      .collection('roles')
      .updateOne(
        { 'id': 'middleAndBackOfficer' },
        {
          $pull: { permittedActions: { 'action.id': 'manageRiskCover' } }
        }
      )
    await db
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
  }
}