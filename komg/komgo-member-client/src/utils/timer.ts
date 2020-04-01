import { unitOfTime, Moment } from 'moment'
import moment from 'moment-timezone'
import { TIME_UNIT_DUE_DATE, TimerValidationRules } from '../features/letter-of-credit-legacy/constants'

export const countExpireDate = (time: number, timeUnit: TIME_UNIT_DUE_DATE): Moment => {
  return moment().add(time, timeUnit.toLowerCase() as unitOfTime.DurationConstructor)
}

export const printExpiryDateInForm = (date: Moment): string => {
  const timeZone = moment.tz(moment.tz.guess()).zoneAbbr()
  return `${date.format('YYYY/MM/DD, dddd, h:mm A')} ${timeZone}`
}

export const printAlreadySharedDocumentDate = (date: Moment): string => {
  const timeZone = moment.tz(moment.tz.guess()).zoneAbbr()
  return `${date.format('DD MMM YY - h:mm A')}`
}

export const validate = (unit: string, duration: number, rules: TimerValidationRules): boolean => {
  const ruleForSpecificUnit = rules[unit]
  if (ruleForSpecificUnit) {
    return duration && unit && duration >= ruleForSpecificUnit.min && duration <= ruleForSpecificUnit.max
  }
  return false
}
