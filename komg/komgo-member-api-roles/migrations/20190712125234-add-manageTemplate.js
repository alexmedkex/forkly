'use strict';

module.exports = {
  async up(db) {
    await db.collection('roles').updateMany(
      {},
      {
        $push: {
          permittedActions: {
            $each: [
              {
                product: {
                  id: 'template',
                  label: 'Template'
                },
                action: {
                  id: 'manageTemplates',
                  label: 'Manage Templates'
                },
                permission: {
                  id: 'read',
                  label: 'Read'
                }
              },
              {
                product: {
                  id: 'template',
                  label: 'Template'
                },
                action: {
                  id: 'manageTemplates',
                  label: 'Manage Templates'
                },
                permission: {
                  id: 'crud',
                  label: 'Create/Read/Update/Delete'
                }
              }
            ]
          }
        }
      }
    )
    return
  },
  async down(db) {
    await db
      .collection('roles')
      .updateMany({}, {
         $pull: {
            permittedActions: {
              'action.id': 'manageTemplates' 
            }
          } 
        })
    return
  }
}
