'use strict'

module.exports = {

  up(db) {
    return db.collection('roles').update(
      {
        id: {
          $in: [
            "kycAnalyst",
            "userAdmin",
            "tradeFinanceOfficer",
            "relationshipManager",
            "complianceOfficer",
            "middleAndBackOfficer",
            "kapsuleAdmin"
          ]
        }
      },
      {
        $set: {
          isSystemRole: true
        }
      },
      {
        multi: true
      }
    )
  },

  down(db) {
    return db.collection('roles').update(
      {},
      {
        $unset: {
          isSystemRole: 1
        }
      },
      {
        multi: true
      }
    )
  }

}