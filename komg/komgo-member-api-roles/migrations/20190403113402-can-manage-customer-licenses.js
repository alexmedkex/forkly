'use strict';

const IS_KOMGO_NODE = process.env.IS_KOMGO_NODE === 'true'

module.exports = {

  up(db) {
    if (!IS_KOMGO_NODE) {
      return
    }

    const role = {
      id: 'komgoAdmin',
      label: 'komgo Admin',
      description: 'komgo Admin',
      isSystemRole: true,
      permittedActions: [
        {
          product: {
            id: 'administration',
            label: 'Administration'
          },
          action: {
            id: 'manageCustomerLicenses',
            label: 'Manage Customer Licenses'
          },
          permission: null
        },
     
      ]
    }

    return db.collection('roles').insertOne(role)    
  },

  down(db) {
    if (!IS_KOMGO_NODE) {
      return
    }
    return db.collection('roles').deleteOne({ id: 'komgoAdmin' })
  }

};