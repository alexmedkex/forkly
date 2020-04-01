import {
  buildFakeReceivablesDiscountingExtended,
  buildFakeReceivablesDiscountingBase,
  DiscountingType,
  RequestType
} from '@komgo/types'

import { cleanDBFieldsFromRD, cleanDBFields } from './cleanDBFields'

describe('cleanDBFields', () => {
  it('should clean out unwanted fields _id, createdAt, updatedAt from an RD object', () => {
    const entity = {
      nonRemovedField: 'myField',
      _id: 'ObjectIdMongo',
      staticId: 'staticId',
      createdAt: '2019-05-19',
      updatedAt: '2019-05-21'
    }

    const cleanEntity = cleanDBFields(entity)

    expect(cleanEntity._id).toBeUndefined()
    expect(cleanEntity.staticId).toBeUndefined()
    expect(cleanEntity.createdAt).toBeUndefined()
    expect(cleanEntity.updatedAt).toBeUndefined()
    expect(cleanEntity.nonRemovedField).toEqual('myField')
  })

  it('should not change an object that conforms to the IReceivablesDiscountingBase interface', () => {
    const rdBase = buildFakeReceivablesDiscountingBase()
    const cleanRD = cleanDBFieldsFromRD(rdBase)

    expect(cleanRD).toEqual(rdBase)
  })
})

describe('cleanDBFieldsFromRD', () => {
  it('should clean out unwanted fields _id, createdAt, updatedAt from an RD object', () => {
    const rdExtended = buildFakeReceivablesDiscountingExtended()
    rdExtended._id = 'ObjectIdMongo'
    rdExtended.createdAt = '2019-05-19'
    rdExtended.updatedAt = '2019-05-21'
    const cleanRD = cleanDBFieldsFromRD(rdExtended)

    expect(cleanRD).toEqual({
      currency: 'USD',
      advancedRate: rdExtended.advancedRate,
      dateOfPerformance: rdExtended.dateOfPerformance,
      discountingDate: rdExtended.discountingDate,
      invoiceAmount: rdExtended.invoiceAmount,
      invoiceType: rdExtended.invoiceType,
      numberOfDaysDiscounting: rdExtended.numberOfDaysDiscounting,
      tradeReference: {
        sellerEtrmId: rdExtended.tradeReference.sellerEtrmId,
        source: rdExtended.tradeReference.source,
        sourceId: rdExtended.tradeReference.sourceId
      },
      requestType: RequestType.Discount,
      discountingType: DiscountingType.WithoutRecourse,
      supportingInstruments: [],
      version: 1
    })
  })

  it('should not change an object that conforms to the IReceivablesDiscountingBase interface', () => {
    const rdBase = buildFakeReceivablesDiscountingBase()
    const cleanRD = cleanDBFieldsFromRD(rdBase)

    expect(cleanRD).toEqual(rdBase)
  })
})
