'use strict'

module.exports = {

  async up(db) {
    await db
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
                'id': 'manageSBLCRequest',
                'label': 'manageSBLCRequest'
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
                'id': 'reviewSBLC',
                'label': 'reviewSBLC'
              },
              'permission': {
                'id': 'read',
                'label': 'read'
              }
            }
          }
        }
      )

    await db
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
                'id': 'reviewSBLC',
                'label': 'reviewSBLC'
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
        { 'id': 'relationshipManager' },
        {
          $push: {
            permittedActions: {
              'product': {
                'id': 'tradeFinance',
                'label': 'tradeFinance'
              },
              'action': {
                'id': 'reviewSBLC',
                'label': 'reviewSBLC'
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

  async down(db) {
    await db
      .collection('roles')
      .updateOne(
        { 'id': 'tradeFinanceOfficer' },
        { $pull: { permittedActions: { 'action.id': 'manageSBLCRequest' } } }
      )

    await db
      .collection('roles')
      .updateOne(
        { 'id': 'middleAndBackOfficer' },
        { $pull: { permittedActions: { 'action.id': 'reviewSBLC' } } }
      )

    await db
      .collection('roles')
      .updateOne(
        { 'id': 'tradeFinanceOfficer' },
        { $pull: { permittedActions: { 'action.id': 'reviewSBLC' } } }
      )

    await db
      .collection('roles')
      .updateOne(
        { 'id': 'relationshipManager' },
        { $pull: { permittedActions: { 'action.id': 'reviewSBLC' } } }
      )
  }
}
