import { BottomSheetItem, BottomSheetStatus, BottomSheetAction, BottomSheetItemType } from './store/types'
import React from 'react'

export const generateBottomsheetTitle = (items: BottomSheetItem[]) => {
  let textHeader = ''
  if (items[0]) {
    const latestStatus = items[0].state
    const count = items.filter(x => x.state === latestStatus).length
    textHeader = getPrintableStatus(latestStatus, count)
  }
  return textHeader
}

const getPrintableStatus = (latestStatus: BottomSheetStatus, count: number) => {
  switch (latestStatus) {
    case BottomSheetStatus.REGISTERED:
      return `${count} document${count > 1 ? 's' : ''} registered`
    case BottomSheetStatus.PENDING:
      return `${count} document${count > 1 ? 's' : ''} pending`
    case BottomSheetStatus.FAILED:
      return `${count} failed registration`
  }
}

export const getStatus = (action: BottomSheetAction): BottomSheetStatus => {
  return BottomSheetStatus.PENDING
}

export function fakeBottomsheetItem<T extends BottomSheetItem>(partial?: Partial<T>): BottomSheetItem {
  const { id, state, name, itemType } = {
    ...{
      id: '-1',
      name: 'anon',
      state: BottomSheetStatus.PENDING,
      itemType: BottomSheetItemType.REGISTER_KYC_DOCUMENT
    },
    ...partial
  }
  return { id, state, name, itemType }
}
