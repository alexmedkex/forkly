'use strict'

module.exports = {
  async up(db) {
    await db.collection('roles').updateOne(
      { id: 'relationshipManager' },
      {
        $push: {
          permittedActions: {
            product: {
              id: 'tradeFinance',
              label: 'tradeFinance'
            },
            action: {
              id: 'manageBankLines',
              label: 'manageBankLines'
            },
            permission: {
              id: 'crud',
              label: 'crud'
            }
          }
        }
      }
    )

    await db.collection('roles').updateOne(
      { id: 'middleAndBackOfficer' },
      {
        $push: {
          permittedActions: {
            product: {
              id: 'tradeFinance',
              label: 'tradeFinance'
            },
            action: {
              id: 'manageBankLines',
              label: 'manageBankLines'
            },
            permission: {
              id: 'read',
              label: 'read'
            }
          }
        }
      }
    )

    return
  },
  async down(db) {
    await db
      .collection('roles')
      .updateOne({ id: 'relationshipManager' }, { $pull: { permittedActions: { 'action.id': 'manageBankLines' } } })

    await db
      .collection('roles')
      .updateOne({ id: 'middleAndBackOfficer' }, { $pull: { permittedActions: { 'action.id': 'manageBankLines' } } })

    return
  }
}
