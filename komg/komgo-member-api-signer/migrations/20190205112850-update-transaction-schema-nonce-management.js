const TRANSACTION_PENDING = 'pending'
const TRANSACTION_CONFIRMED = 'confirmed'
const TRANSACTION_FAILED = 'failed'
const TRANSACTION_REVERTED = 'reverted'

const TRANSACTIONS_COLLECTION_NAME = 'transactions'
module.exports = {
  async up(db) {
    const transactions = await db
      .collection(TRANSACTIONS_COLLECTION_NAME)
      .find()
      .toArray()

    for (const tx of transactions) {
      // If the tx has already been migrated, skip this tx
      // This should never happen
      if (tx.status !== undefined) {
        continue
      }

      const updatedTx = {
        nonce: tx.nonce,
        from: tx.from,
        body: tx.body,
        hash: tx.hash,
        status: TRANSACTION_FAILED, // Safety property, we don't retry transactions by default
        requestOrigin: tx.requestId
      }

      if (tx.failed && tx.confirmed) {
        updatedTx.status = TRANSACTION_REVERTED
      } else if (tx.confirmed) {
        updatedTx.status = TRANSACTION_CONFIRMED
      } else if (tx.failed) {
        updatedTx.status = TRANSACTION_FAILED
      } else if (tx.hash !== undefined) {
        // Tx will be retried and the tx receipt status will be checked
        updatedTx.status = TRANSACTION_PENDING
      }

      await db.collection(TRANSACTIONS_COLLECTION_NAME).replaceOne({ _id: tx._id }, updatedTx)
    }
  },

  down(db) {
    // Impossible to rollback. signed transaction was lost.
  }
}
