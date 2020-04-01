'use strict'
module.exports = {
  up(db) {
    return db.collection('roles').insert({
      id: 'tfmBeneficiary',
      label: 'Trade Finance Manager/Analyst (Beneficiary)',
      description: 'Trade Finance Manager/Analyst (Beneficiary)',
      permittedActions: [
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
    return db.collection('roles').remove({ id: 'tfmBeneficiary' })
  }
}

