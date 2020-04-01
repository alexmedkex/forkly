'use strict'
module.exports = {
  up(db) {
    return db.collection('roles').insert({
      id: 'kycAnalyst',
      label: 'KYC Manager/Analyst',
      description: 'KYC Manager/Analyst Role',
      permittedActions: [
        // manage documents
        {
          permission: {
            id: 'read',
            label: 'Read'
          },
          action: {
            id: 'manageDoc',
            label: 'Manage Documents'
          },
          product: {
            id: 'kyc',
            label: 'Know Your Customer'
          }
        },
        {
          permission: {
            id: 'crudAndShare',
            label: 'Crud And Share'
          },
          action: {
            id: 'manageDoc',
            label: 'Manage Documents'
          },
          product: {
            id: 'kyc',
            label: 'Know Your Customer'
          }
        },
        // Request Document
        {
          permission: {
            id: 'readRequest',
            label: 'Read Request'
          },
          action: {
            id: 'requestDoc',
            label: 'readRequest'
          },
          product: {
            id: 'kyc',
            label: 'Know Your Customer'
          }
        },
        {
          permission: {
            id: 'read',
            label: 'Read'
          },
          action: {
            id: 'requestDoc',
            label: 'readRequest'
          },
          product: {
            id: 'kyc',
            label: 'Know Your Customer'
          }
        },
        // Manage Document Request
        {
          permission: {
            id: 'crudAndShare',
            label: 'Register/Share/Update/Delete'
          },
          action: {
            id: 'manageDocRequest',
            label: 'Manage Document Request'
          },
          product: {
            id: 'kyc',
            label: 'Know Your Customer'
          }
        },
        {
          permission: {
            id: 'read',
            label: 'Read'
          },
          action: {
            id: 'manageDocRequest',
            label: 'Manage Document Request'
          },
          product: {
            id: 'kyc',
            label: 'Know Your Customer'
          }
        },
      ]
    })
  },

  down(db) {
    return db.collection('roles').remove({ id: 'kycAnalyst' })
  }
}