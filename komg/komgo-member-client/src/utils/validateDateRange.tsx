import moment from 'moment'

const validateDateRange = (startDate, endDate) => {
  if (!!startDate && !!endDate) {
    return moment(startDate).isSameOrBefore(moment(endDate))
  }
  return true
}

export default validateDateRange
