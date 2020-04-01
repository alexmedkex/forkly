'use strict'
module.exports = {
  up(db) {
    return db.collection('roles').insert({
      id: 'tfmIssuingBank',
      label: 'Trade Finance Manager/Analyst (Issuing Bank)',
      description: 'Trade Finance Manager/Analyst (Issuing Bank)',
      permittedActions: [
        // Manage letter of credit Request
        {
          permission: {
            id: 'read',
            label: 'Read'
          },
          action: {
            id: 'manageLCrequest',
            label: 'Manage Letter of Credit Request'
          },
          product: {
            id: 'tradeFinance',
            label: 'Trade Finance'
          }
        },
        // manage Letter of Credit Application
        {
          permission: {
            id: 'read',
            label: 'Read'
          },
          action: {
            id: 'manageLCapplication',
            label: 'Manage Letter of Credit Application'
          },
          product: {
            id: 'tradeFinance',
            label: 'Trade Finance'
          }
        },
        {
          permission: {
            id: 'create',
            label: 'Create'
          },
          action: {
            id: 'manageLCapplication',
            label: 'Manage Letter of Credit Application'
          },
          product: {
            id: 'tradeFinance',
            label: 'Trade Finance'
          }
        },
        {
          permission: {
            id: 'update',
            label: 'Update'
          },
          action: {
            id: 'manageLCapplication',
            label: 'Manage Letter of Credit Application'
          },
          product: {
            id: 'tradeFinance',
            label: 'Trade Finance'
          }
        },
        {
          permission: {
            id: 'delete',
            label: 'Delete'
          },
          action: {
            id: 'manageLCapplication',
            label: 'Manage Letter of Credit Application'
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
            label: 'Read'
          },
          action: {
            id: 'reviewLC',
            label: 'Review Letter of Credit'
          },
          product: {
            id: 'tradeFinance',
            label: 'Trade Finance'
          }
        },
      ]
    })
  },

  down(db) {
    return db.collection('roles').remove({ id: 'tfmIssuingBank' })
  }
}

