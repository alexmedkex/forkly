'use strict';
var predef = require('../config/predefined-document-types');

module.exports = {

  async up(db) {
    await db.collection('types').updateMany({},
      { $set: {
        predefined: false
      }
      }
    )
    for (const type of predef.types) {
      await db.collection('types').updateOne(type, 
        { $set: {
            predefined: true
          }
        }
      )
    }
  },

  async down(db) {
    await db.collection('types').updateMany({},
      { $unset: {
        predefined: null
      }
      }
    )
  }

};