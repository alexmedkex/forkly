import { Order } from '../../store/common/types'
import moment from 'moment'
import _ from 'lodash'

export const sortPerBoolean = (column: string, direction: Order, sortedItems: any[]) => {
  const newItems = [...sortedItems]
  newItems.sort((first, second) => {
    const firstField = _.get(first, column, false)
    const secondField = _.get(second, column, false)
    if (firstField === secondField) {
      return 0
    }
    if (direction === Order.Asc) {
      return !secondField && firstField ? 1 : -1
    }
    return !firstField && secondField ? 1 : -1
  })
  return newItems
}

export const sortPerDate = (column: string, direction: Order, sortedItems: any[]) => {
  const newItems = [...sortedItems]
  newItems.sort((first, second) => {
    const isBefore = moment(second[column]).isBefore(first[column])
    const isSame = moment(second[column]).isSame(first[column])
    if (isSame) {
      return 0
    }
    if (direction === Order.Asc) {
      return isBefore ? 1 : -1
    }
    return isBefore ? -1 : 1
  })
  return newItems
}

export const sortPerString = (column: string, direction: Order, sortedItems: any[]) => {
  const newItems = [...sortedItems]
  newItems.sort((first, second) => {
    const firstField = _.get(first, column, '')
    const secondField = _.get(second, column, '')
    const i = firstField.localeCompare(secondField)
    return direction === Order.Asc ? i : -i
  })
  return newItems
}

export const sortPerNumber = (column: string, direction: Order, sortedItems: any[]) => {
  const newItems = [...sortedItems]
  newItems.sort((first, second) => {
    const firstField = _.get(first, column, 0)
    const secondField = _.get(second, column, 0)
    if (direction === Order.Asc) {
      return firstField - secondField
    }
    return secondField - firstField
  })
  return newItems
}
