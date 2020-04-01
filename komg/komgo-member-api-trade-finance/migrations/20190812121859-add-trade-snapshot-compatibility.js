module.exports = {
  up(db, next) {
    db.collection('lcs').find({}).forEach(result => {
      const lcId = result._id
      const tradeId = result.tradeAndCargoSnapshot.trade._id
      if (typeof tradeId === 'object') {
        console.log(`LC=${lcId} has a trade with objectId=${tradeId} migrating...`)
        db.collection('lcs').updateOne({_id: lcId}, { '$set': {'tradeAndCargoSnapshot.trade._id': tradeId + '' }}, next)
      }
    }, next)
  },

  down(db) {
  }
};
