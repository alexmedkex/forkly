import validateDateRange from './validateDateRange'

describe('validateDateRange function', () => {
  it('should return false when start date is after end date', () => {
    expect(validateDateRange('2019-5-5', '2019-5-4')).toBe(false)
  })
  it('should return true when start date is before end date', () => {
    expect(validateDateRange('2019-5-5', '2019-5-7')).toBe(true)
  })
  it('should return true when start date is empty string', () => {
    expect(validateDateRange('', '2019-5-4')).toBe(true)
  })
})
