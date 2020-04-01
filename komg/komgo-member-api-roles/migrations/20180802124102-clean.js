'use strict';

const names = [
  'permissions', 
  'actions', 
  'products', 
  'permittedactions', 
  'roles'
];

module.exports = {

  up(db, next) {
    db.listCollections().toArray(function(err, collections) {
      if (err) throw new Error('Error connecting to the database.');
      const drops = collections.map(collection => {
        if (names.indexOf(collection.name) !== -1) {
          console.log(`Added "${collection.name}" to remove queue...`);
          return db.collection(collection.name).drop();
        } else {
          return Promise.resolve();
        }
      });
      Promise.all(drops).then(() => next());
    });
  },

  down(db, next) {
    next();
  }

};