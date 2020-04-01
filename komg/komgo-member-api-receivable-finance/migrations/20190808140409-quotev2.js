const QUOTE_COLLECTION = 'quotes'
const DEFAULT_FEE_CALCULATION_TYPE = 'STRAIGHT'
const LIBOR = 'LIBOR'
const DEFAULT_LIBOR_TYPE = 'PUBLISHED'
const DEFAULT_DAYS_UNTIL_MATURITY = 30

module.exports = {
  async up(db) {
    await db.collection(QUOTE_COLLECTION).updateMany(
      {},
      {
        $set: {
          feeCalculationType: DEFAULT_FEE_CALCULATION_TYPE
        }
      }
    )

    await db.collection(QUOTE_COLLECTION).updateMany(
      { interestType: LIBOR },
      {
        $set: {
          liborType: DEFAULT_LIBOR_TYPE
        }
      }
    )

    await db.collection(QUOTE_COLLECTION).updateMany(
      { liborType: DEFAULT_LIBOR_TYPE },
      {
        $set: {
          daysUntilMaturity: DEFAULT_DAYS_UNTIL_MATURITY
        }
      }
    )
  },

  async down(db) {
    await db.collection(QUOTE_COLLECTION).updateMany(
      {},
      {
        $unset: {
          feeCalculationType: 1,
          liborType: 1,
          daysUntilMaturity: 1
        }
      }
    )
  }
}
