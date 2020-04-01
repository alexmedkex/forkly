import moment = require('moment')
import { IPeriod } from '@komgo/types'

export const mapPeriod = (period: IPeriod): { startDate: Date; endDate: Date } => {
  return period
    ? {
        startDate: mapDate(period.startDate),
        endDate: mapDate(period.endDate)
      }
    : null
}

export const mapDate = (date): Date => {
  return date ? moment(date, 'YYYY-MM-DD', true).toDate() : date
}
