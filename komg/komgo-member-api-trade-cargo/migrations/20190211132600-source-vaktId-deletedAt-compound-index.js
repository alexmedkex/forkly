'use strict';

module.exports = {
  up(db, next) {
    try {
      db.collection('trades').dropIndex('source_1_vaktId_1')
    } catch (error) {
    }

    try {
      db.collection('trades').createIndex( { "source": 1, "vaktId": 1, "deletedAt": 1 }, { unique: true} )
    } catch (error) {      
    }
    next();
  },

  down(db, next) {
    try {
      db.collection('trades').dropIndex('source_1_vaktId_1_deletedAt_1')
    } catch (error) {      
    }    
    next();
  }
};