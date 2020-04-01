import * as React from 'react'
import { FieldWithLabel } from './Field'
import { findFieldFromTradeSchema } from '../utils/displaySelectors'
import Label from './Label'
import { IHistoryChange, IHistoryEntry } from '@komgo/types'
import { getHistoryEntry } from '../utils/historyChangesUtil'
import { HistoryPopup } from '../../receivable-discounting-legacy/components/tooltips/HistoryPopup'
import { displayDate } from '../../../utils/date'

interface HideableLabelledFieldProps {
  field: any
  fieldName: string
  schema: any
  formatter?: (input: any) => string
  historyEntry?: IHistoryEntry<any>
}

export const HideableLabelledField: React.FC<HideableLabelledFieldProps> = ({
  field,
  fieldName,
  schema,
  formatter = value => value,
  historyEntry
}) => {
  const fieldDisplay = formatter(field)
  const historyChanges = createFormattedHistory(historyEntry, fieldName, formatter)

  return (
    !!field && (
      <FieldWithLabel>
        <Label>{findFieldFromTradeSchema('title', fieldName, schema)}</Label>
        {historyChanges ? (
          <HistoryPopup fieldName={fieldName} currentFieldValue={fieldDisplay} historyValues={historyChanges} />
        ) : (
          fieldDisplay
        )}
      </FieldWithLabel>
    )
  )
}

export function createFormattedHistory(
  fieldHistory: IHistoryEntry<any>,
  fieldName: string,
  formatter: ((input) => string) | (() => any)
) {
  if (fieldHistory && getHistoryEntry(fieldName, fieldHistory)) {
    const entry = getHistoryEntry(fieldName, fieldHistory) as Array<IHistoryChange<any>>
    return entry.map(change => {
      return {
        updatedAt: displayDate(change.updatedAt),
        values: [formatter(change.value)]
      }
    })
  }
  return undefined
}
