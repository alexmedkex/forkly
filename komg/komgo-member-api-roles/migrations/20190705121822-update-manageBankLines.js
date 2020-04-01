'use strict'

module.exports = {
  async up(db) {
    await db.collection('roles').updateOne(
      { id: 'tradeFinanceOfficer' },
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

    return
  },
  async down(db) {
    await db
      .collection('roles')
      .updateOne({ id: 'tradeFinanceOfficer' }, { $pull: { permittedActions: { 'action.id': 'manageBankLines' } } })

    return
  }
}
