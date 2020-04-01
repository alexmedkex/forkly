const TRADES_COLLECTION = 'trades'
const CreditRequirement = {
  DocumentaryLetterOfCredit: 'DOCUMENTARY_LETTER_OF_CREDIT',
  StandbyLetterOfCredit: 'STANDBY_LETTER_OF_CREDIT',
  OpenCredit: 'OPEN_CREDIT',
  Offset: 'OFFSET'
}
module.exports = {
 up(db, next) {
    db.collection(TRADES_COLLECTION).updateMany(
      { creditRequirement: { $exists: false } },
      { $set: { creditRequirement: CreditRequirement.DocumentaryLetterOfCredit } }
    )

    next()
  },

  down(db, next) {
    db.collection(TRADES_COLLECTION).updateMany(
      {},
      {$unset: { creditRequirement: 1 } }
    )
    next()
  }
}
