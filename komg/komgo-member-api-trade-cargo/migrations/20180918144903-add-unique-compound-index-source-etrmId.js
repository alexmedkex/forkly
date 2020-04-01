'use strict';

module.exports = {

  up(db) {
    return db.collection('trades').createIndex( { "source": 1, "etrmId": 1 }, { unique: true} )
  },

  down(db) {
    return db.collection('trades').dropIndex('source_1_etrmId_1')
  }

};