'use strict';

module.exports = {

  up(db, next) {
    try {
      db.collection('trades').dropIndex('etrmId_1')
    } catch (err) { 
    }

    try {
      db.collection('trades').dropIndex('source_1_etrmId_1');
    }catch (err) {      
    }
    next();
  },

  down(db, next) {
    // TODO write the statements to rollback your migration (if possible)
    next();
  }

};