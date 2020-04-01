'use strict'

module.exports = {
  up(db) {
    return Promise.all([
      db.collection('companies').updateMany({ 'isMember': true, 'isFMS': true }, { $set: { memberType: 'FMS' } }),
      db.collection('companies').updateMany({ 'isMember': true, 'isFMS': false }, { $set: { memberType: 'SMS' } })
    ])
  },

  down(db, next) {
    next()
  }
}
