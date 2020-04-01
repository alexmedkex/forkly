import { IHistory, IHistoryEntry, ITrade, ICargo, IHistoryChange } from '@komgo/types'

export function getTradeHistoryEntry(fieldHistory): IHistoryEntry<ITrade> {
  if (fieldHistory && fieldHistory.historyEntry && fieldHistory.historyEntry.trade) {
    return fieldHistory.historyEntry.trade.historyEntry
  }
  return {}
}

export function getCargoHistoryEntry(fieldHistory): IHistoryEntry<ICargo> {
  if (fieldHistory && fieldHistory.historyEntry && fieldHistory.historyEntry.movements) {
    return fieldHistory.historyEntry.movements
  }
  return {}
}

/**
 * Returns the IHistoryEntry<T> for the given field name in a IHistory<any> object
 *
 * Example nested field:
 * fieldHistory:
 * {
 *    historyEntry: {
 *       deliveryPeriod: {
 *          historyEntry: {
 *            startDate: '19/05/1985'
 *            endDate: '19/05/1985'
 *          }
 *       }
 *    }
 * }
 * fieldName='deliveryPeriod.startDate'
 * returns {  startDate: '19/05/1985', endDate: '19/05/1985'}
 *  }
 * @param fieldName of the IHistoryEntry<T> to get
 * @param fieldHistory
 */
export function getHistoryEntry<T>(
  fieldName: string,
  fieldHistory: IHistoryEntry<T>
): IHistoryEntry<T> | Array<IHistoryChange<T>> | Array<IHistory<T>> {
  if (!fieldHistory) {
    return undefined
  }
  const fieldNameParts = fieldName.split('.')
  let fieldHistoryEntry = fieldHistory[fieldNameParts.shift()] as IHistoryEntry<any>
  for (const fieldName of fieldNameParts) {
    if (fieldHistoryEntry && fieldHistoryEntry.historyEntry && fieldHistoryEntry.historyEntry[fieldName]) {
      fieldHistoryEntry = fieldHistoryEntry.historyEntry[fieldName]
    } else {
      return undefined
    }
  }
  return fieldHistoryEntry
}
