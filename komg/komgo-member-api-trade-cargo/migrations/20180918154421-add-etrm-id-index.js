'use strict';

module.exports = {

  up(db) {
    return db.collection('trades').createIndex( { 'etrmId': 1 })
  },

  down(db) {
    return db.collection('trades').dropIndex('etrmId_1')
  }

};