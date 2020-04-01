'use strict';

const IS_KOMGO_NODE = process.env.IS_KOMGO_NODE === 'true'

module.exports = {

  up(db) {
    if (!IS_KOMGO_NODE) {
      return
    }

    const role = {
      id: 'memberNodeAccount',
      label: 'Member Node Account',
      description: 'Member Node Account',
      isSystemRole: true,
      permittedActions: [
        {
          product: {
            id: 'administration',
            label: 'Administration'
          },
          action: {
            id: 'manageCustomerData',
            label: 'Manage Customer Data'
          },
          permission: {
            id: 'crud',
            label: 'Create/Read/Update/Delete'
          }
        }
      ]
    }

    return db.collection('roles').insertOne(role)
  },

  down(db) {
    if (!IS_KOMGO_NODE) {
      return
    }
    return db.collection('roles').deleteOne({ id: 'memberNodeAccount' })
  }

};