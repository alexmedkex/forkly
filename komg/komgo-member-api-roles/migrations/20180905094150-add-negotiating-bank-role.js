'use strict'
module.exports = {
  up(db) {
    return db.collection('roles').insert({
      id: 'tfmNegBank',
      label: 'Trade Finance Manager/Analyst (NegotiatingBank)',
      description: 'Trade Finance Manager/Analyst (NegotiatingBank) Role',
      permittedActions: [
        // manage trades
        {
          permission: {
            id: 'read',
            label: 'read'
          },
          action: {
            id: 'manageTrades',
            label: 'Manage trades'
          },
          product: {
            id: 'tradeFinance',
            label: 'Trade Finance'
          }
        },
        // manage movements
        {
          permission: {
            id: 'read',
            label: 'Read'
          },
          action: {
            id: 'manageMovements',
            label: 'Manage Movements'
          },
          product: {
            id: 'tradeFinance',
            label: 'Trade Finance'
          }
        },
        // review Letter of Credit
        {
          permission: {
            id: 'read',
            label: 'read'
          },
          action: {
            id: 'reviewLC',
            label: 'Review Letter of Credit'
          },
          product: {
            id: 'tradeFinance',
            label: 'Trade Finance Negotiating Bank'
          }
        },
        {
          permission: {
            id: 'create',
            label: 'create'
          },
          action: {
            id: 'reviewLC',
            label: 'Review Letter of Credit'
          },
          product: {
            id: 'tradeFinance',
            label: 'Trade Finance Negotiating Bank'
          }
        },
        {
          permission: {
            id: 'update',
            label: 'Update'
          },
          action: {
            id: 'reviewLC',
            label: 'Review Letter of Credit'
          },
          product: {
            id: 'tradeFinance',
            label: 'Trade Finance Negotiating Bank'
          }
        },
        {
          permission: {
            id: 'delete',
            label: 'Delete'
          },
          action: {
            id: 'reviewLC',
            label: 'Review Letter of Credit'
          },
          product: {
            id: 'tradeFinance',
            label: 'Trade Finance Negotiating Bank'
          }
        },
      ]
    })
  },

  down(db) {
    return db.collection('roles').remove({ id: 'tfmNegBank' })
  }
}

