'use strict'

module.exports = {
  up(db) {
    return db.collection('roles').insert({
      id: 'coverageManager',
      label: 'Manage counterparty coverage',
      description: 'Manage counterparty coverage',
      permittedActions: [{
          permission: {
            id: 'read',
            label: 'Read'
          },
          action: {
            id: 'manageCoverage',
            label: 'Manage Coverage'
          },
          product: {
            id: 'coverage',
            label: 'Counterparty management'
          }
        },
        {
          permission: {
            id: 'crud',
            label: 'Create/Update/Delete'
          },
          action: {
            id: 'manageCoverage',
            label: 'Manage Coverage'
          },
          product: {
            id: 'coverage',
            label: 'Counterparty management'
          }
        }
      ]
    })
  },

  down(db) {
    return db.collection('roles').remove({
      id: 'coverageManager'
    })
  }
};