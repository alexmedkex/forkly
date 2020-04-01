'use strict';

const TEMPLATE_COLLECTION = 'templates'

module.exports = {
  up(db) {
    return db.collection(TEMPLATE_COLLECTION).updateMany({}, { $set: { origin: 'SYSTEM' } })
  },

  down(db) {
    return db.collection(TEMPLATE_COLLECTION).updateMany({}, { $unset: { origin: '' } })
  }
};