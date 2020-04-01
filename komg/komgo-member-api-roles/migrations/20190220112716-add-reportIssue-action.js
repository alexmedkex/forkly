'use strict';

module.exports = {

  up(db) {
    return db
      .collection('roles')
      .updateMany(
        { 'isSystemRole': true },
        {
          $push: {
            permittedActions: {
              "product": {
                "id": "administration",
                "label": "administration"
              },
              "action": {
                "id": "reportIssue",
                "label": "reportIssue"
              },
              "permission": null
            }
          }
        }
      )
  },
  down(db) {
    return db
      .collection('roles')
      .updateMany(
        { 'isSystemRole': true },
        { $pull: { permittedActions: { 'action.id': 'reportIssue' } } }
      )
  }
};
