const RD_COLLECTION = 'receivables-discountings'

const RequestType = {
  RiskCover : "RISK_COVER",
  RiskCoverDiscounting : "RISK_COVER_DISCOUNTING",
  Discount : "DISCOUNT"
}

const DiscountingType  ={
  Recourse : "RECOURSE",
  WithoutRecourse : "WITHOUT_RECOURSE",
  Blended : "BLENDED"
}

module.exports = {
  async up(db) {
    await db.collection(RD_COLLECTION).updateMany({}, {
      $set:
      {
        requestType: RequestType.Discount,
        discountingType: DiscountingType.WithoutRecourse,
        supportingInstruments: []
      }
    })
  },

  async down(db) {
    await db.collection(RD_COLLECTION).updateMany({}, {
      $unset:
      {
        requestType: 1,
        discountingType: 1,
        supportingInstruments: 1
      }
    })
  }
}
