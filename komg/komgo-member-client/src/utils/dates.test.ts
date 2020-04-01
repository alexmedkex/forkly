import { displayDate, isLaterThan } from './date'

describe('displayDate', () => {
  const exampleDate = new Date('2018-09-18T12:15:26.000Z')
  it('converts timestamp into expected date format', () => {
    expect(displayDate(exampleDate)).toBe('2018/09/18')
  })
  it('converts timestamp with leading 0 in day and month to expected date format', () => {
    expect(displayDate(new Date(0))).toEqual('1970/01/01')
  })
})

describe('isLaterThan', () => {
  describe('string', () => {
    it('should return true if the first date-time is later than the second', () => {
      expect(isLaterThan('2019-03-24T18:26:23.561Z', '2019-03-24T18:26:22.561Z')).toBeTruthy()
    })
    it('should return false if the second date-time is later than the first', () => {
      expect(isLaterThan('2019-03-25', '2019-03-24T18:26:23.561Z')).toBeTruthy()
    })
    it('should return false the two date-times are equal', () => {
      const date = '2019-03-24T18:26:23.561Z'
      expect(isLaterThan(date, date)).toBeFalsy()
    })
  })
  describe('Date', () => {
    it('should return true if the first date-time is later than the second', () => {
      expect(isLaterThan(Date.parse('2019-03-24T18:26:23.561Z'), Date.parse('2019-03-24T18:26:22.561Z'))).toBeTruthy()
    })
    it('should return false if the second date-time is later than the first', () => {
      expect(isLaterThan(Date.parse('2019-03-25'), Date.parse('2019-03-24T18:26:23.561Z'))).toBeTruthy()
    })
    it('should return false the two date-times are equal', () => {
      const date = '2019-03-24T18:26:23.561Z'
      expect(isLaterThan(Date.parse(date), Date.parse(date))).toBeFalsy()
    })
  })
})
