import moment from 'moment-timezone'
import { TIME_UNIT_DUE_DATE, TIMER_VALIDATION_RULES } from '../features/letter-of-credit-legacy/constants'
import { printExpiryDateInForm, countExpireDate, validate } from './timer'

describe('Timer Utils', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => 1487076708000)
    moment.tz.guess = jest.fn(() => 'Europe/Belgrade')
    moment.tz.setDefault('Europe/Belgrade')
  })

  afterEach(() => {
    moment.tz.setDefault()
  })

  describe('countExpireDate()', () => {
    it('should return appropriate moment', () => {
      expect(countExpireDate(1, TIME_UNIT_DUE_DATE.DAYS)).toEqual(moment().add(1, 'days'))
      expect(countExpireDate(5, TIME_UNIT_DUE_DATE.HOURS)).toEqual(moment().add(5, 'hours'))
      expect(countExpireDate(1, TIME_UNIT_DUE_DATE.WEEKS)).toEqual(moment().add(1, 'weeks'))
    })
  })

  describe('printExpireDateInForm()', () => {
    it('should return appropriate string', () => {
      expect(printExpiryDateInForm(moment())).toEqual('2017/02/14, Tuesday, 1:51 PM CET')
    })
  })

  describe('validate()', () => {
    it('should validate timer values when HOURS is passed as unit', () => {
      expect(validate(TIME_UNIT_DUE_DATE.HOURS, 5, TIMER_VALIDATION_RULES)).toBe(true)
      expect(validate(TIME_UNIT_DUE_DATE.HOURS, 1, TIMER_VALIDATION_RULES)).toBe(true)
      expect(validate(TIME_UNIT_DUE_DATE.HOURS, -1, TIMER_VALIDATION_RULES)).toBe(false)
      expect(validate(TIME_UNIT_DUE_DATE.HOURS, 199, TIMER_VALIDATION_RULES)).toBe(false)
      expect(validate(TIME_UNIT_DUE_DATE.HOURS, 1, {})).toBe(false)
    })

    it('should validate timer values when DAYS is passed as unit', () => {
      expect(validate(TIME_UNIT_DUE_DATE.DAYS, 1, TIMER_VALIDATION_RULES)).toBe(true)
      expect(validate(TIME_UNIT_DUE_DATE.DAYS, 9, TIMER_VALIDATION_RULES)).toBe(false)
      expect(validate(TIME_UNIT_DUE_DATE.DAYS, 1, {})).toBe(false)
    })

    it('should validate timer values when WEEKS is passed as unit', () => {
      expect(validate(TIME_UNIT_DUE_DATE.WEEKS, 1, TIMER_VALIDATION_RULES)).toBe(true)
      expect(validate(TIME_UNIT_DUE_DATE.WEEKS, 2, TIMER_VALIDATION_RULES)).toBe(false)
      expect(validate(TIME_UNIT_DUE_DATE.WEEKS, 1, {})).toBe(false)
    })
  })
})
