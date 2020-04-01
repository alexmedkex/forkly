import * as React from 'react'

import { BottomSheetRowPending, BottomSheetRowRegistered, BottomSheetRowError } from '../components'
import { BottomSheetItem, BottomSheetStatus, BottomSheetItemType } from '../store/types'
import { MaximumVisibleRows } from '../containers/BottomSheet'

export interface Props {
  item: BottomSheetItem
  rowNumber: number
  openState: MaximumVisibleRows
  actions?: Map<BottomSheetStatus, (item: BottomSheetItem) => void>
  removeBottomSheetItem(id: string): void
}
export const BottomSheetRowFactory = (props: Props) => {
  const { item } = props
  switch (item.itemType) {
    case BottomSheetItemType.REGISTER_KYC_DOCUMENT:
    default:
      return <DocumentBottomSheetItem {...props} />
  }
}

export const DocumentBottomSheetItem = (props: Props) => {
  const { item, rowNumber, openState } = props
  switch (item.state) {
    case BottomSheetStatus.PENDING:
      return (
        <BottomSheetRowPending
          key={item.id}
          numRow={rowNumber}
          item={item}
          visible={rowNumber <= openState}
          expanded={openState > MaximumVisibleRows.OPEN}
        />
      )
    case BottomSheetStatus.FAILED:
      return (
        <BottomSheetRowError
          key={item.id}
          numRow={rowNumber}
          item={item}
          visible={rowNumber <= openState}
          expanded={openState > MaximumVisibleRows.OPEN}
          onExtraActionClick={props.actions.get(BottomSheetStatus.FAILED)}
        />
      )
    case BottomSheetStatus.REGISTERED:
      return (
        <BottomSheetRowRegistered
          key={item.id}
          numRow={rowNumber}
          item={item}
          visible={rowNumber <= openState}
          expanded={openState > MaximumVisibleRows.OPEN}
          onExtraActionClick={props.removeBottomSheetItem}
          onNavigateToClick={props.actions.get(BottomSheetStatus.REGISTERED)}
        />
      )
  }
}
