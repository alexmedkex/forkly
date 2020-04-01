'use strict'

module.exports = {
  up(db) {
    return db.collection('roles').update(
      { id: 'userAdmin' },
      {
        $set: {
          label: 'User Admin',
          description: 'Can manage users and roles',
          permittedActions: [
            {
              permission: {
                id: 'read',
                label: 'Read'
              },
              action: {
                id: 'manageUsers',
                label: 'Manage Users'
              },
              product: {
                id: 'administration',
                label: 'Administration'
              }
            },
            {
              permission: {
                id: 'create',
                label: 'Create'
              },
              action: {
                id: 'manageUsers',
                label: 'Manage Users'
              },
              product: {
                id: 'administration',
                label: 'Administration'
              }
            },
            {
              permission: {
                id: 'update',
                label: 'Update'
              },
              action: {
                id: 'manageUsers',
                label: 'Manage Users'
              },
              product: {
                id: 'administration',
                label: 'Administration'
              }
            },
            {
              permission: {
                id: 'delete',
                label: 'Delete'
              },
              action: {
                id: 'manageUsers',
                label: 'Manage Users'
              },
              product: {
                id: 'administration',
                label: 'Administration'
              }
            },
            {
              permission: {
                id: 'read',
                label: 'Read'
              },
              action: {
                id: 'manageUserRoles',
                label: 'Manage User Roles'
              },
              product: {
                id: 'administration',
                label: 'Administration'
              }
            },
            {
              permission: {
                id: 'create',
                label: 'Create'
              },
              action: {
                id: 'manageUserRoles',
                label: 'Manage User Roles'
              },
              product: {
                id: 'administration',
                label: 'Administration'
              }
            },
            {
              permission: {
                id: 'update',
                label: 'Update'
              },
              action: {
                id: 'manageUserRoles',
                label: 'Manage User Roles'
              },
              product: {
                id: 'administration',
                label: 'Administration'
              }
            },
            {
              permission: {
                id: 'delete',
                label: 'Delete'
              },
              action: {
                id: 'manageUserRoles',
                label: 'Manage User Roles'
              },
              product: {
                id: 'administration',
                label: 'Administration'
              }
            }
          ]
        }
      }
    )
  },

  down(db) {
    return db.collection('roles').update(
      { id: 'userAdmin' },
      {
        $set: {
          label: 'User Admin',
          description: 'User Admin Role',
          permittedActions: [
            {
              permission: {
                id: 'get',
                label: 'Get'
              },
              action: {
                id: 'manageUsers',
                label: 'Manage Users'
              },
              product: {
                id: 'userAdmin',
                label: 'User Admin'
              }
            },
            {
              permission: {
                id: 'create',
                label: 'Create'
              },
              action: {
                id: 'manageUsers',
                label: 'Manage Users'
              },
              product: {
                id: 'userAdmin',
                label: 'User Admin'
              }
            },
            {
              permission: {
                id: 'update',
                label: 'Update'
              },
              action: {
                id: 'manageUsers',
                label: 'Manage Users'
              },
              product: {
                id: 'userAdmin',
                label: 'User Admin'
              }
            },
            {
              permission: {
                id: 'delete',
                label: 'Delete'
              },
              action: {
                id: 'manageUsers',
                label: 'Manage Users'
              },
              product: {
                id: 'userAdmin',
                label: 'User Admin'
              }
            },
            {
              permission: {
                id: 'get',
                label: 'Get'
              },
              action: {
                id: 'manageUserRoles',
                label: 'Manage User Roles'
              },
              product: {
                id: 'userAdmin',
                label: 'User Admin'
              }
            },
            {
              permission: {
                id: 'create',
                label: 'Create'
              },
              action: {
                id: 'manageUserRoles',
                label: 'Manage User Roles'
              },
              product: {
                id: 'userAdmin',
                label: 'User Admin'
              }
            },
            {
              permission: {
                id: 'update',
                label: 'Update'
              },
              action: {
                id: 'manageUserRoles',
                label: 'Manage User Roles'
              },
              product: {
                id: 'userAdmin',
                label: 'User Admin'
              }
            },
            {
              permission: {
                id: 'delete',
                label: 'Delete'
              },
              action: {
                id: 'manageUserRoles',
                label: 'Manage User Roles'
              },
              product: {
                id: 'userAdmin',
                label: 'User Admin'
              }
            }
          ]
        }
      }
    )
  }
}
