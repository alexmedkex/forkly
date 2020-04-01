'use strict'
module.exports = {
  up(db) {
    return db.collection('roles').insert({
      id: 'tfmApplicant',
      label: 'Trade Finance Manager/Analyst (Applicant)',
      description: 'Trade Finance Manager/Analyst (Applicant) Role',
      permittedActions: [
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
        {
          permission: {
            id: 'create',
            label: 'Create'
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
        {
          permission: {
            id: 'update',
            label: 'Update'
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
        {
          permission: {
            id: 'delete',
            label: 'Delete'
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
        // manage trades
        {
          permission: {
            id: 'read',
            label: 'Read'
          },
          action: {
            id: 'manageTrades',
            label: 'Manage Trades'
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
            id: 'manageTrades',
            label: 'Manage Trades'
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
            id: 'manageTrades',
            label: 'Manage Trades'
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
            id: 'manageTrades',
            label: 'Manage Trades'
          },
          product: {
            id: 'tradeFinance',
            label: 'Trade Finance'
          }
        },
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
        {
          permission: {
            id: 'create',
            label: 'Create'
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
        {
          permission: {
            id: 'update',
            label: 'Update'
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
        {
          permission: {
            id: 'delete',
            label: 'Delete'
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
        {
          permission: {
            id: 'create',
            label: 'Create'
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
            label: 'Trade Finance'
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
            label: 'Trade Finance'
          }
        },
      ]
    })
  },

  down(db) {
    return db.collection('roles').remove({ id: 'tfmApplicant' })
  }
}

