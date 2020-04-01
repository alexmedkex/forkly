import moment from 'moment'
import { IPaymentsTerms, IPeriod } from '..//features/trades/store/types'
import { NOTENOUGHINFO } from '..//features/trades/constants'

export const dateFormats = {
  default: 'YYYY/MM/DD',
  inputs: 'YYYY-MM-DD'
}

type StringOrDateOrNumber = string | Date | number
const toDate = (d: StringOrDateOrNumber) => (typeof d === 'string' ? Date.parse(d) : d)

export const isLaterThan = (date1: StringOrDateOrNumber, date2: StringOrDateOrNumber) => toDate(date1) > toDate(date2)

export const displayDate = (date: Date | string | number | undefined, format: string = dateFormats.default): string => {
  if (!date) {
    return undefined
  }
  return moment(date).format(format)
}

export const isDate = (date: Date | string): boolean => {
  if (date instanceof Date) {
    return true
  }
  if (typeof date === 'number' || date === undefined || typeof date === 'object') {
    return false
  }
  return moment(date, [moment.ISO_8601, moment.RFC_2822]).isValid()
}
export const displayDateAndTime = (date: Date | string | number | undefined): string => {
  if (!date) {
    return ''
  }
  return moment(date).format('YYYY/MM/DD, h:mm A')
}

export const displayHours = (hours?: number): string => {
  if (!hours) {
    return ''
  }
  return `${hours} hours`
}

export const displayPeriod = (period?: IPeriod): string => {
  if (!period) {
    return ''
  }
  return `from ${displayDate(period.startDate)} to ${displayDate(period.endDate)}`
}

export const displayPaymentTerms = (deliveryTerm?: IPaymentsTerms): string => {
  if (!deliveryTerm) {
    return NOTENOUGHINFO
  }
  return `${deliveryTerm.time} ${deliveryTerm.dayType} ${deliveryTerm.timeUnit} ${deliveryTerm.when} ${
    deliveryTerm.eventBase
  }`
}

export const displayTimeWithTimeZone = (date: Date | string | number | undefined): string => {
  const timeZone = moment.tz(moment.tz.guess()).zoneAbbr()
  const time = moment(date).format('h:mma')
  return `${time} ${timeZone}`
}

export const isInPast = (date: Date | number | string): boolean => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  return moment(date).isBefore(now)
}
