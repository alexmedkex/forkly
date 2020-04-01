'use strict';

const TEMPLATE_COLLECTION = 'templates'
const validStaticId = '2a27c0b2-1772-4a87-b940-750d5dbc4e92'
const invalidStaticId = 'fc7c042a-7034-4fc0-b4ad-651816f727440'

module.exports = {

  up(db) {
    return db.collection(TEMPLATE_COLLECTION).updateOne({ staticId: invalidStaticId }, { $set: { staticId: validStaticId } });
  },

  down(db) {
    return db.collection(TEMPLATE_COLLECTION).updateOne({ staticId: validStaticId }, { $set: { staticId: invalidStaticId } });
  }

};