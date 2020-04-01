import { isErrorActive } from './isErrorActive'
import { FormikErrors } from 'formik'
import { ITrade } from '@komgo/types'

describe('isErrorActive function', () => {
  it('should return false when all fields are untouched', () => {
    expect(isErrorActive('test', {}, {})).toBe(false)
  })
  it('should return false when all fields are untouched', () => {
    expect(isErrorActive('test.test', {}, {})).toBe(false)
  })
  it('should return true when error exists and field is touched', () => {
    expect(isErrorActive('seller', { seller: 'Error' }, { seller: true })).toBe(true)
  })
  it('should return true when error exists and field is touched', () => {
    const error = { 'deliveryPeriod.endDate': 'Error' } as FormikErrors<ITrade>
    expect(isErrorActive('deliveryPeriod.endDate', error, { deliveryPeriod: { endDate: true } })).toBe(true)
  })
  it('should return false when error exists and field is not touched', () => {
    expect(isErrorActive('seller', { seller: 'Error' }, {})).toBe(false)
  })
  it('should return false when error exists and field is not touched', () => {
    expect(isErrorActive<{}>('deliveryPeriod.endDate', { deliveryPeriod: { endDate: 'Error' } }, {})).toBe(false)
  })
})
