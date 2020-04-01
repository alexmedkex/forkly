'use strict';

module.exports = {

  up(db, next) {
    // TODO write your migration here
    try {
      db.collection('trades').createIndex( { "source": 1, "vaktId": 1 }, { unique: true} )
    } catch (error) {      
    } 
    next();
  },

  down(db, next) {
    // TODO write the statements to rollback your migration (if possible)

    try {
      db.collection('trades').dropIndex('source_1_vaktId_1')
    } catch (error) {      
    }    
    next();
  }

};