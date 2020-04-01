const TRANSACTIONS_COLLECTION_NAME = 'transactions'

module.exports = {
  async up(db) {
    await db.collection(TRANSACTIONS_COLLECTION_NAME).updateMany({ hash: null }, { $unset: { hash: '' } })
  },

  down(db) {
    // No need for a rollback as the transaction hash should never be null.
  }
}
