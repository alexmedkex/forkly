'use strict'

const readPublicKeysAction = {
  product: {
    id: 'administration',
    label: 'Administration'
  },
  action: {
    id: 'readPublicKeys',
    label: 'Read Public Keys'
  },
  permission: null
}

module.exports = {
  up(db) {
    return db.collection('roles').insert({
      id: 'kapsuleAdmin',
      label: 'Kapsule Admin',
      description: 'Kapsule Admin',
      permittedActions: [readPublicKeysAction]
    })
  },

  down(db) {
    return db.collection('roles').remove({ id: 'kapsuleAdmin' })
  }
}
