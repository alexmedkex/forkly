'use strict'

module.exports = {
  up(db) {
    return db.collection('roles').updateOne({ id: 'tradeFinanceOfficer' }, { $set: { isSystemRole: true } })
  },

  down(db, next) {
    // not required
    next()
  }
}
