'use strict';

module.exports = {
  async up(db, next) {
    await db.collection('received-documents').find().forEach(receivedDocs => {
      if (Array.isArray(receivedDocs.documents)){
        receivedDocs.documents.forEach(doc => {
          if(!doc.reviewerId){
            doc['reviewerId'] = ''
          }
        })
        return db.collection('received-documents').updateMany({_id: receivedDocs._id}, { $set: {"documents": receivedDocs.documents}}, {upsert: true})
    }
    }).then(() => {
      return next()
    }).catch(err => next(err))
  },

  async down(db, next) {
    await db.collection('received-documents').find().forEach(receivedDocs => {
      if (Array.isArray(receivedDocs.documents)){
        receivedDocs.documents.forEach(doc => {
          if(doc.reviewerId){
            delete doc['reviewerId']
          }
        })
        return db.collection('received-documents').updateMany({_id: receivedDocs._id}, { $set: {"documents": receivedDocs.documents}}, {upsert: true})
    }
    }).then(() => {
      return next()
    }).catch(err => next(err))
  }
}