'use strict'

module.exports = {
  up(db) {
    const role = {
      id: 'tradeFinanceOfficer',
      label: 'Trade Finance Officer/Manager/Analyst',
      description: 'Trade Finance Officer',
      permittedActions: [
        {
          product: {
            id: 'tradeFinance',
            label: 'Trade Finance'
          },
          action: {
            id: 'manageTrades',
            label: 'Manage Trades'
          },
          permission: {
            id: 'crud',
            label: 'Create/Update/Delete'
          }
        },
        {
          product: {
            id: 'tradeFinance',
            label: 'Trade Finance'
          },
          action: {
            id: 'manageLCRequest',
            label: 'Manage L/C request'
          }
        },
        {
          product: {
            id: 'tradeFinance',
            label: 'Trade Finance'
          },
          action: {
            id: 'reviewIssuedLC',
            label: 'Review issued LC'
          },
          permission: {
            id: 'readWrite',
            label: 'ReadWrite'
          }
        },
        {
          product: {
            id: 'tradeFinance',
            label: 'Trade Finance'
          },
          action: {
            id: 'manageCollection',
            label: 'Manage Collection'
          }
        },
        {
          product: {
            id: 'tradeFinance',
            label: 'Trade Finance'
          },
          action: {
            id: 'managePresentation',
            label: 'Manage Presentation'
          }
        },
        {
          product: {
            id: 'coverage',
            label: 'Counterparty management'
          },
          action: {
            id: 'manageCoverage',
            label: 'Manage Coverage'
          },
          permission: {
            id: 'crud',
            label: 'Create/Update/Delete'
          }
        }
      ]
    }

    return db.collection('roles').replaceOne({ id: role.id }, role, { upsert: true })
  },

  down(db, next) {
    // TODO write the statements to rollback your migration (if possible)
    next()
  }
}
