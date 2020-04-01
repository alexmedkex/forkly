import { findTouchedErrors } from './findTouchedErrors'
import { FormikErrors, FormikTouched } from 'formik'
import { ITrade } from '@komgo/types'

describe('isErrorActive function', () => {
  const errors = {
    seller: {
      name: 'Error'
    }
  }
  const touched = {
    seller: {
      name: true
    }
  }
  it('should return empty array where there arent any error', () => {
    expect(findTouchedErrors({}, {})).toEqual({})
  })
  it('should return empty array if field is not touched', () => {
    expect(findTouchedErrors({ seller: 'Error' }, {})).toEqual({})
  })
  it('should return error object with one "seller" error', () => {
    expect(findTouchedErrors({ seller: 'Error' }, { seller: true })).toEqual({ seller: 'Error' })
  })
  it('should return empty array if field is not touched', () => {
    expect(findTouchedErrors(errors, {})).toEqual({})
  })
  it('should return error object with one "seller.name" error', () => {
    expect(findTouchedErrors(errors, touched)).toEqual(errors)
  })

  it('should return right errors for nested object', () => {
    const errors = {
      discountingDate: "'discountingDate' should not be empty",
      'financialInstrumentInfo.financialInstrument': "'financialInstrument' should not be empty",
      'financialInstrumentInfo.financialInstrumentIssuerName': "'financialInstrumentIssuerName' should not be empty",
      'financialInstrumentInfo.guarantor': "'guarantor' should not be empty",
      invoiceAmount: "'invoiceAmount' should be strictly greater than 0",
      numberOfDaysDiscounting: "'numberOfDaysDiscounting' should not be empty"
    }
    const touched = {
      currency: true,
      dateOfPerformance: true,
      discountingDate: true,
      discountingType: true,
      financialInstrumentInfo: {
        financialInstrument: true,
        financialInstrumentIssuerName: true,
        guarantor: true
      },
      invoiceAmount: true,
      invoiceType: true,
      numberOfDaysDiscounting: true,
      requestType: true,
      riskCoverDate: true,
      supportingInstruments: [true],
      tradeReference: { sourceId: true, sellerEtrmId: true, source: true },
      version: true
    }
    expect(findTouchedErrors(errors, touched as any)).toEqual(errors)
  })
})
