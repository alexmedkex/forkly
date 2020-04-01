import * as moment from 'moment'

import { PRODUCT_ID, SubProductId } from '../constants'

const ISO8601DateFormatUTC = 'YYYY-MM-DDTHH:mm:ss.SSSZ'
const DB_TIMESTAMP_FIELDS = ['createdAt', 'updatedAt']

export function removeTimeFromDates<T>(entity: T): T {
  return Object.keys(entity).reduce((memo: any, key: any) => {
    if (!isDBTimestamp(key) && moment(entity[key], ISO8601DateFormatUTC, true).isValid()) {
      return {
        [key]: formatDateToYYYYmmDD(entity[key]),
        ...memo
      }
    } else {
      return {
        [key]: entity[key],
        ...memo
      }
    }
  }, {})
}

function isDBTimestamp(field: string) {
  return DB_TIMESTAMP_FIELDS.includes(field)
}

export function formatDateToYYYYmmDD(date: string | Date) {
  if (!date) {
    return undefined
  }
  const dateObj = new Date(date)
  const dd = dateObj.getDate() <= 9 ? '0' + dateObj.getDate() : dateObj.getDate()
  const month = dateObj.getMonth() + 1
  const mm = month <= 9 ? '0' + month : month
  const result = `${dateObj.getFullYear()}-${mm}-${dd}`
  return result
}

export function getContextForTask(rdId: string, senderStaticId: string) {
  return {
    productId: PRODUCT_ID,
    subProductId: SubProductId.ReceivableDiscounting,
    rdId,
    senderStaticId
  }
}
